import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Lê o código-fonte e falha o build quando uma fronteira é cruzada.
 * Você não precisa lembrar das regras: o teste lembra e o diff mostra quem quebrou.
 */
const SRC = join(__dirname);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry) && !entry.endsWith('.test.ts') ? [full] : [];
  });
}

function importsOf(file: string): string[] {
  const source = readFileSync(file, 'utf8');
  return [...source.matchAll(/from\s+'([^']+)'/g)].map((match) => match[1] ?? '');
}

const FILES = sourceFiles(SRC);

describe('domínio isolado', () => {
  const FORBIDDEN = [
    'react',
    'react-native',
    'zustand',
    'expo-sqlite',
    'expo-haptics',
    '@tanstack/react-query',
    '@react-navigation',
    '@/core/designsystem',
    '@/core/navigation',
  ];

  const domainFiles = FILES.filter((file) => /(^|\/)domain\//.test(relative(SRC, file)));

  it('não importa React, banco, navegação nem design system', () => {
    const offenders: string[] = [];

    for (const file of domainFiles) {
      for (const specifier of importsOf(file)) {
        if (specifier.startsWith('@/core/domain/model')) continue;
        if (FORBIDDEN.some((forbidden) => specifier === forbidden || specifier.startsWith(`${forbidden}/`))) {
          offenders.push(`${relative(SRC, file)} → ${specifier}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it('não importa a camada data nem presentation da própria feature', () => {
    const offenders = domainFiles.flatMap((file) =>
      importsOf(file)
        .filter((specifier) => /\/(data|presentation)\//.test(specifier))
        .map((specifier) => `${relative(SRC, file)} → ${specifier}`),
    );

    expect(offenders).toEqual([]);
  });
});

describe('feature só pela porta pública', () => {
  it('uma feature importa outra por @/feature/<nome> e nada mais fundo', () => {
    const offenders: string[] = [];

    for (const file of FILES) {
      const owner = relative(SRC, file).split('/')[1];
      for (const specifier of importsOf(file)) {
        const match = /^@\/feature\/([^/]+)\/(.+)$/.exec(specifier);
        if (!match) continue;
        if (match[1] === owner) continue;
        /** A porta de domínio é pública também: é por ela que regra fala com regra. */
        if (match[2] === 'domain') continue;
        offenders.push(`${relative(SRC, file)} → ${specifier}`);
      }
    }

    expect(offenders).toEqual([]);
  });
});

describe('core não depende de feature', () => {
  /** As duas raízes de composição: quem injeta dependência e quem monta as rotas. */
  const COMPOSITION_ROOTS = ['core/di/', 'core/navigation/reactnavigation/RootNavigator/'];

  it('só as raízes de composição conhecem as implementações das features', () => {
    const offenders = FILES.filter((file) => relative(SRC, file).startsWith('core/'))
      .filter((file) => !COMPOSITION_ROOTS.some((root) => relative(SRC, file).startsWith(root)))
      .flatMap((file) =>
        importsOf(file)
          .filter((specifier) => specifier.startsWith('@/feature/'))
          .map((specifier) => `${relative(SRC, file)} → ${specifier}`),
      );

    expect(offenders).toEqual([]);
  });
});

describe('biblioteca de navegação confinada', () => {
  it('nenhuma feature importa @react-navigation direto', () => {
    const offenders = FILES.filter((file) => relative(SRC, file).startsWith('feature/'))
      .flatMap((file) =>
        importsOf(file)
          .filter((specifier) => specifier.startsWith('@react-navigation'))
          .map((specifier) => `${relative(SRC, file)} → ${specifier}`),
      );

    expect(offenders).toEqual([]);
  });
});

describe('marca desacoplada do core', () => {
  it('nome comercial só existe na pasta de marcas', () => {
    const offenders = FILES.filter((file) => !relative(SRC, file).includes('designsystem/brands'))
      .filter((file) => {
        const source = readFileSync(file, 'utf8');
        const code = source.replace(/\/\*\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
        return /'(Tecsa|Vitta)[^']*'|"(Tecsa|Vitta)[^"]*"/.test(code);
      })
      .map((file) => relative(SRC, file));

    expect(offenders).toEqual([]);
  });
});

describe('chave de query é contrato compartilhado', () => {
  it('nenhuma feature declara queryKey própria', () => {
    const offenders = FILES.filter((file) => relative(SRC, file).startsWith('feature/'))
      .filter((file) => /queryKey:\s*\[/.test(readFileSync(file, 'utf8')))
      .map((file) => relative(SRC, file));

    expect(offenders).toEqual([]);
  });
});
