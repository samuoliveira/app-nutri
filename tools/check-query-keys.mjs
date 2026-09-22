#!/usr/bin/env node
// Toda invalidação precisa de uma chave registrada em core/query/query-keys.
// Chave sem registrante é tela que salva e não atualiza.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const KEYS_FILE = join(ROOT, 'src/core/query/query-keys/index.ts');

const registry = readFileSync(KEYS_FILE, 'utf8');
const registered = new Set([...registry.matchAll(/^\s{2}(\w+):\s*\{/gm)].map((match) => match[1]));

const offenders = [];

for (const file of walk(join(ROOT, 'src'))) {
  const path = relative(ROOT, file);
  if (path.startsWith('src/core/query')) continue;

  const source = readFileSync(file, 'utf8');

  for (const [, group] of source.matchAll(/queryKeys\.(\w+)\./g)) {
    if (!registered.has(group)) offenders.push(`${path} → queryKeys.${group} não existe no registro`);
  }

  for (const [, literal] of source.matchAll(/queryKey:\s*\[([^\]]*)\]/g)) {
    if (!literal.includes('queryKeys')) offenders.push(`${path} → queryKey literal [${literal.trim()}]`);
  }
}

if (offenders.length === 0) {
  console.log(`chaves de query: ok (${registered.size} grupos registrados)`);
  process.exit(0);
}

console.log(offenders.join('\n'));
process.exit(1);

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.tsx?$/.test(entry) && !entry.endsWith('.test.ts') ? [full] : [];
  });
}
