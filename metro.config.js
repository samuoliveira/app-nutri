const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const config = getDefaultConfig(__dirname);

/**
 * O backend mora no mesmo repositório, mas não faz parte do bundle.
 * Sem isso, salvar um arquivo em backend/ dispara Fast Refresh no app.
 */
const IGNORED = [
  /\/backend\/.*/,
  /\/ios\/build\/.*/,
  /\/android\/(build|\.gradle)\/.*/,
  /\/\.expo\/.*/,
];

config.resolver.blockList = IGNORED;
config.watchFolders = [path.resolve(__dirname, 'src'), path.resolve(__dirname, 'assets')];

module.exports = config;
