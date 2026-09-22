// A DEFINIÇÃO DO PADRÃO. Fonte única e executável.
//
// Consumidores:
//   tools/check-code.mjs   — arquivo avulso, staged ou repo inteiro
//   tools/agent-guard.mjs  — hook PostToolUse: barra o agente na hora da escrita
//
// Duas famílias:
//   LINE_RULES — testam uma linha. Aceitam escape por comentário na linha acima.
//   FILE_RULES — testam o arquivo inteiro. Sem escape: são erro de estrutura.
//
// `scope` decide ONDE a regra vale, pelo caminho do arquivo.
// Regra sem `scope` vale em todo `src`.

const SCOPES = {
  // Toda a UI: design system e camada de apresentação das features.
  ui: /^src\/(core\/designsystem|feature\/[^/]+\/presentation|core\/navigation)\//,
  // Código de feature, das três camadas.
  feature: /^src\/feature\//,
  // Regra pura: não conhece React, banco, navegação nem tela.
  domain: /^src\/(feature\/[^/]+\/domain|core\/domain)\//,
  // Camada que fala com rede e banco.
  data: /^src\/(feature\/[^/]+\/data|core\/data)\//,
  // Onde a marca pode existir em forma de literal.
  brands: /^src\/core\/designsystem\/brands\//,
  // Onde a biblioteca de navegação pode ser importada.
  navigationLib: /^src\/core\/navigation\/reactnavigation\//,
  // Onde transporte de rede pode existir.
  network: /^src\/core\/network\//,
  // Onde chave de query pode ser declarada.
  queryKeys: /^src\/core\/query\//,
};

const LINE_RULES = [
  {
    // Estilo mora em StyleSheet.create ou nos tokens: inline escapa do tema
    // e recria em cada render.
    id: 'estilo-inline',
    scope: SCOPES.ui,
    appliesTo: /\.tsx$/,
    test: (line) => /style=\{\{/.test(line),
    escape: 'style-ok:',
    message: 'estilo inline: use StyleSheet.create ou um token do design system',
  },
  {
    // Cor literal no código quebra o white-label: a marca deixa de ser dado.
    id: 'cor-hardcoded',
    scope: /^src\/(feature|core\/navigation)\//,
    appliesTo: /\.tsx?$/,
    test: (line) => /#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(line),
    escape: 'cor-ok:',
    message: 'cor literal: pegue de theme.palette — marca é dado, não código',
  },
  {
    // O Text do design system carrega fonte, escala e tom da marca.
    id: 'text-cru',
    scope: SCOPES.feature,
    appliesTo: /\.tsx$/,
    test: (line) => /import\s*\{[^}]*\bText\b[^}]*\}\s*from\s*'react-native'/.test(line),
    escape: 'text-cru-ok:',
    message: 'Text do react-native: use o Text de @/core/designsystem/native',
  },
  {
    id: 'any-explicito',
    appliesTo: /\.tsx?$/,
    test: (line) => /:\s*any\b|<any>|as any\b/.test(line),
    escape: 'any-ok:',
    message: 'any explícito: descreva o tipo ou use unknown com narrowing',
  },
  {
    // Divergência de plataforma vive em arquivo .ios.tsx/.android.tsx,
    // não espalhada por if dentro da tela.
    id: 'platform-espalhado',
    scope: SCOPES.feature,
    appliesTo: /\.tsx?$/,
    test: (line) => /Platform\.OS\s*===/.test(line),
    escape: 'platform-ok:',
    message: 'Platform.OS na feature: mova para .ios.tsx / .android.tsx ou para o design system',
  },
  {
    id: 'console',
    appliesTo: /\.tsx?$/,
    test: (line) => /\bconsole\.(log|debug|info)\(/.test(line),
    escape: 'console-ok:',
    message: 'console solto: remova ou troque por estado visível na tela',
  },
  {
    // Chave de query é contrato compartilhado: mora em core/query/query-keys.
    id: 'query-key-inline',
    scope: /^src\/(feature|core)\//,
    appliesTo: /\.tsx?$/,
    exclude: SCOPES.queryKeys,
    test: (line) => /queryKey:\s*\[/.test(line),
    escape: 'key-externa-ok:',
    message: 'queryKey literal: registre em core/query/query-keys',
  },
  {
    // Transporte só existe em core/network; repositório usa a fonte.
    id: 'fetch-fora-da-rede',
    scope: /^src\//,
    exclude: SCOPES.network,
    appliesTo: /\.tsx?$/,
    test: (line) => /\bfetch\(|axios\./.test(line),
    escape: 'fetch-ok:',
    message: 'chamada de rede fora de core/network: passe pelo transporte tipado',
  },
  {
    // Lista longa sem virtualização trava com 2.000 pacientes.
    id: 'lista-sem-virtualizacao',
    scope: SCOPES.ui,
    appliesTo: /\.tsx$/,
    test: (line) => /import\s*\{[^}]*\bFlatList\b[^}]*\}\s*from\s*'react-native'/.test(line),
    escape: 'lista-ok:',
    message: 'FlatList: use FlashList (@shopify/flash-list) para carteira longa',
  },
  {
    // useEffect é sincronização com o mundo de fora; para dado, use query.
    id: 'use-effect',
    scope: SCOPES.ui,
    appliesTo: /\.tsx?$/,
    test: (line) => /\buseEffect\(/.test(line),
    escape: 'useEffect-ok:',
    severity: 'debt',
    message: 'useEffect: confirme que é sincronização com o mundo externo, não busca de dado',
  },
];

const FILE_RULES = [
  {
    // Pasta é o nome do componente; o arquivo é sempre index.
    id: 'componente-fora-do-index',
    scope: /^src\//,
    appliesTo: /\.tsx$/,
    test: (source, path) => {
      const file = path.split('/').pop() ?? '';
      if (/^index\.tsx$/.test(file)) return false;
      if (/\.(test|ios|android)\.tsx$/.test(file)) return false;
      return true;
    },
    message: 'componente fora de index.tsx: pasta com o nome do componente + index.tsx',
  },
  {
    // Tipagem mora em types.ts, ao lado do index que a usa.
    id: 'tipo-no-index',
    scope: /^src\//,
    appliesTo: /index\.tsx?$/,
    test: (source) => /^export (interface|type) \w+Props\b/m.test(source),
    message: 'tipo de props no index: mova para types.ts na mesma pasta',
  },
  {
    // O domínio é o miolo: sem React, sem banco, sem navegação, sem tela.
    id: 'dominio-contaminado',
    scope: SCOPES.domain,
    appliesTo: /\.tsx?$/,
    test: (source) =>
      /from '(react|react-native|zustand|expo-[^']+|@tanstack\/[^']+|@react-navigation\/[^']+)'/.test(source) ||
      /from '@\/core\/(designsystem|navigation|database)/.test(source),
    message: 'domínio importando biblioteca de fora: a regra tem que rodar sem simulador',
  },
  {
    // Marca é dado da pasta brands; no resto do app ela chega pelo theme.
    id: 'marca-no-core',
    scope: /^src\//,
    exclude: SCOPES.brands,
    appliesTo: /\.tsx?$/,
    test: (source) => {
      const code = source.replace(/\/\*\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      return /'(Tecsa|Vitta)[^']*'|"(Tecsa|Vitta)[^"]*"/.test(code);
    },
    message: 'nome de marca no código: use theme.displayName / theme.assistantName',
  },
  {
    // A biblioteca de navegação fica confinada em core/navigation/reactnavigation.
    id: 'navegacao-vazada',
    scope: /^src\/feature\//,
    appliesTo: /\.tsx?$/,
    test: (source) => /from '@react-navigation\//.test(source),
    message: 'feature importando @react-navigation: peça destino ao coordinator',
  },
  {
    // Fatia vertical fala com fatia vertical só pela porta pública.
    id: 'feature-por-dentro',
    scope: /^src\/feature\//,
    appliesTo: /\.tsx?$/,
    test: (source, path) => {
      const owner = path.split('/')[2];
      const imports = [...source.matchAll(/from '@\/feature\/([^/']+)\/([^']+)'/g)];
      return imports.some(([, feature, rest]) => feature !== owner && rest !== 'domain');
    },
    message: 'import fundo em outra feature: use @/feature/<nome> ou @/feature/<nome>/domain',
  },
  {
    id: 'arquivo-gordo',
    scope: /^src\//,
    appliesTo: /\.tsx?$/,
    severity: 'debt',
    test: (source) => source.split('\n').length > 260,
    message: 'arquivo acima de 260 linhas: quebre em componente ou módulo próprio',
  },
];

export { FILE_RULES, LINE_RULES, SCOPES };

/** Roda todas as regras contra um arquivo e devolve as violações. */
export function checkSource(path, source) {
  const violations = [];
  const lines = source.split('\n');

  for (const rule of LINE_RULES) {
    if (!applies(rule, path)) continue;

    lines.forEach((line, index) => {
      if (!rule.test(line)) return;
      const previous = lines[index - 1] ?? '';
      if (rule.escape && previous.includes(rule.escape)) return;

      violations.push({
        rule: rule.id,
        severity: rule.severity ?? 'error',
        line: index + 1,
        message: rule.message,
        escape: rule.escape ?? null,
      });
    });
  }

  for (const rule of FILE_RULES) {
    if (!applies(rule, path)) continue;
    if (!rule.test(source, path)) continue;

    violations.push({
      rule: rule.id,
      severity: rule.severity ?? 'error',
      line: 0,
      message: rule.message,
      escape: null,
    });
  }

  return violations;
}

function applies(rule, path) {
  if (rule.appliesTo && !rule.appliesTo.test(path)) return false;
  if (rule.scope && !rule.scope.test(path)) return false;
  if (rule.exclude && rule.exclude.test(path)) return false;
  return true;
}
