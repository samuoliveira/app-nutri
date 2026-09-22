#!/usr/bin/env node
// Barra `git add -A` e `git add .`: commit tem que dizer o que entra.

import { readFileSync } from 'node:fs';

const input = JSON.parse(readFileSync(0, 'utf8'));
const command = input?.tool_input?.command ?? '';

if (!/\bgit\s+add\b/.test(command)) process.exit(0);
if (!/\bgit\s+add\s+(-A\b|--all\b|\.\s*$|\.\s)/.test(command)) process.exit(0);

console.error('git add -A / . barrado: liste os caminhos ou use pathspec de exclusão.');
process.exit(2);
