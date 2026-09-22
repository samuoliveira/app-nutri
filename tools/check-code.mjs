#!/usr/bin/env node
// Roda o padrão contra arquivos: avulsos, `--staged` ou `--all`.
//   npm run check:code src/feature/patients/presentation/PatientsScreen/index.tsx
//   npm run check:code -- --staged
//   npm run check:code -- --all [--debt]

import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkSource } from './rules.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const showDebt = args.includes('--debt');
const files = resolveFiles(args.filter((arg) => !arg.startsWith('--')));

let errors = 0;
let debt = 0;

for (const file of files) {
  const path = relative(ROOT, file);
  const violations = checkSource(path, readFileSync(file, 'utf8'));
  if (violations.length === 0) continue;

  const visible = violations.filter((violation) => showDebt || violation.severity !== 'debt');
  if (visible.length === 0) {
    debt += violations.length;
    continue;
  }

  console.log(`\n${path}`);
  for (const violation of visible) {
    const where = violation.line > 0 ? `:${violation.line}` : '';
    const tag = violation.severity === 'debt' ? 'DÍVIDA' : 'ERRO';
    console.log(`  ${tag} ${violation.rule}${where} — ${violation.message}`);
    if (violation.escape) console.log(`        escape legítimo: // ${violation.escape} <motivo>`);
    if (violation.severity === 'debt') debt += 1;
    else errors += 1;
  }
}

console.log(
  `\n${files.length} arquivo(s) · ${errors} erro(s)${debt > 0 ? ` · ${debt} dívida(s)${showDebt ? '' : ' (use --debt)'}` : ''}`,
);

process.exit(errors > 0 ? 1 : 0);

function resolveFiles(explicit) {
  if (explicit.length > 0) return explicit.map((file) => join(ROOT, file));

  if (args.includes('--staged')) {
    const output = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf8' });
    return output
      .split('\n')
      .filter((line) => /\.tsx?$/.test(line))
      .map((line) => join(ROOT, line));
  }

  return walk(join(ROOT, 'src'));
}

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.tsx?$/.test(entry) && !entry.endsWith('.test.ts') ? [full] : [];
  });
}
