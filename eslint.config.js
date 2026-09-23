// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'backend/*', 'coverage/*', '.expo/*'],
  },
  {
    rules: {
      // O projeto usa ReadonlyArray<T> de propósito: lê melhor em tipo de domínio.
      '@typescript-eslint/array-type': 'off',
      // Regras do React Compiler. O app não liga o compiler, e `useRef(new
      // Animated.Value()).current` é o idioma do RN que elas marcam. Ficam
      // como aviso até o compiler entrar.
      'react-hooks/refs': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/use-memo': 'warn',
    },
  },
]);
