#!/usr/bin/env node
// Regra nova nasce com teste: use case puro + arquivo de teste ao lado.
//   npm run new:usecase patients/archive-patient

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = process.argv[2];

if (!target || !target.includes('/')) {
  console.error('uso: npm run new:usecase <feature>/<nome-do-caso>');
  process.exit(1);
}

const [feature, name] = target.split('/');
const className = name
  .split('-')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('');
const dir = join(ROOT, 'src/feature', feature, 'domain', name);

if (existsSync(dir)) {
  console.error(`${target} já existe`);
  process.exit(1);
}

mkdirSync(dir, { recursive: true });

writeFileSync(
  join(dir, 'types.ts'),
  `export interface ${className}Input {\n  placeholder?: never;\n}\n\nexport interface ${className}Output {\n  placeholder?: never;\n}\n`,
);

writeFileSync(
  join(dir, 'index.ts'),
  `import { ok, type Result } from '@/core/domain/result';
import type { ${className}Input, ${className}Output } from './types';

export type { ${className}Input, ${className}Output } from './types';

/** Regra pura: sem React, sem banco, sem rede. */
export class ${className} {
  async execute(_input: ${className}Input): Promise<Result<${className}Output>> {
    return ok({} as ${className}Output);
  }
}
`,
);

writeFileSync(
  join(dir, 'index.test.ts'),
  `import { ${className} } from './index';

describe('${className}', () => {
  it('descreve a regra em uma frase e prova aqui', async () => {
    const result = await new ${className}().execute({});
    expect(result.ok).toBe(true);
  });
});
`,
);

console.log(`criado src/feature/${feature}/domain/${name}/ (com teste)`);
console.log('exporte na porta de domínio: src/feature/' + feature + '/domain/index.ts');
