#!/usr/bin/env node
// Hook PostToolUse: roda o padrão no arquivo que o agente acabou de escrever
// e devolve as violações na hora. Dívida não bloqueia — só erro.
//
// Regra de ouro: saída curta. Relatório longo ensina o agente a ignorar a saída.

import { readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkSource } from './rules.mjs';

const input = JSON.parse(readFileSync(0, 'utf8'));
const path = input?.tool_input?.file_path ?? input?.tool_input?.path;

if (!path || !/\.tsx?$/.test(path) || path.endsWith('.test.ts')) process.exit(0);

let source;
try {
  source = readFileSync(path, 'utf8');
} catch {
  process.exit(0);
}

const relativePath = relative(join(dirname(fileURLToPath(import.meta.url)), '..'), path);
const violations = checkSource(relativePath, source).filter((violation) => violation.severity !== 'debt');

if (violations.length === 0) process.exit(0);

const lines = violations
  .slice(0, 6)
  .map((violation) => `${violation.rule}${violation.line > 0 ? `:${violation.line}` : ''} — ${violation.message}`);

console.error(`${relativePath}\n${lines.join('\n')}`);
process.exit(2);
