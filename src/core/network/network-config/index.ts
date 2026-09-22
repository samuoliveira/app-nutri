import type { NetworkConfig } from './types';

export type { NetworkConfig } from './types';

export const defaultNetworkConfig: NetworkConfig = {
  latencyMs: 320,
  jitterMs: 260,
  failureRate: 0.04,
  timeoutRate: 0.02,
  timeoutMs: 6000,
  forcedOffline: false,
};

let current: NetworkConfig = { ...defaultNetworkConfig };

export function getNetworkConfig(): NetworkConfig {
  return current;
}

export function setNetworkConfig(patch: Partial<NetworkConfig>): void {
  current = { ...current, ...patch };
}

export function resetNetworkConfig(): void {
  current = { ...defaultNetworkConfig };
}
