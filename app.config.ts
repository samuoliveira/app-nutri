import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * HTTP em claro só nos perfis que falam com o backend local (`ALLOW_HTTP` no
 * eas.json). Build de release bloqueia `http://` por padrão; produção mantém.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const plugins = config.plugins ?? [];
  const allowHttp = process.env.ALLOW_HTTP === 'true';

  return {
    ...config,
    name: config.name ?? 'Tecsa Nutrition',
    slug: config.slug ?? 'tecsa-nutri',
    plugins: allowHttp
      ? [...plugins, ['expo-build-properties', { android: { usesCleartextTraffic: true } }]]
      : plugins,
  };
};
