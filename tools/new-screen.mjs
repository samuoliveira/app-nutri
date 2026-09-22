#!/usr/bin/env node
// Tela nova nasce pronta: pasta com index.tsx, types.ts e os quatro estados.
//   npm run new:screen patients/PatientHistoryScreen

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = process.argv[2];

if (!target || !target.includes('/')) {
  console.error('uso: npm run new:screen <feature>/<NomeScreen>');
  process.exit(1);
}

const [feature, name] = target.split('/');
const dir = join(ROOT, 'src/feature', feature, 'presentation', name);

if (existsSync(dir)) {
  console.error(`${target} já existe`);
  process.exit(1);
}

mkdirSync(dir, { recursive: true });

writeFileSync(
  join(dir, 'types.ts'),
  `export interface ${name}Props {\n  /** Descreva aqui o que a tela recebe de fora. */\n  placeholder?: never;\n}\n`,
);

writeFileSync(
  join(dir, 'index.tsx'),
  `import { ScrollView, StyleSheet } from 'react-native';

import { EmptyView, ErrorView, Screen, SkeletonList, Text } from '@/core/designsystem/native';
import { spacing } from '@/core/designsystem/tokens';
import { toUiState } from '@/core/presentation/ui-state';
import type { ${name}Props } from './types';

export function ${name}(_props: ${name}Props) {
  const ui = toUiState<ReadonlyArray<never>>({ isPending: false, error: null, data: [], isEmpty: (list) => list.length === 0 });

  if (ui.kind === 'loading') {
    return (
      <Screen>
        <SkeletonList rows={6} />
      </Screen>
    );
  }

  if (ui.kind === 'error') {
    return (
      <Screen>
        <ErrorView error={ui.error} onRetry={() => undefined} />
      </Screen>
    );
  }

  if (ui.kind === 'empty') {
    return (
      <Screen>
        <EmptyView title="Nada por aqui" body="Descreva o que o usuário pode fazer agora." />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <Text token="title1">${name}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.screenX, paddingTop: spacing.lg, paddingBottom: 150 },
});
`,
);

console.log(`criado src/feature/${feature}/presentation/${name}/`);
console.log('exporte a tela na porta pública e registre a rota em core/navigation.');
