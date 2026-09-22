import { defaultFlags, type FlagKey, type FlagSnapshot } from '@/core/flags/flags';

/**
 * Estado das flags "no servidor". A tela Mais escreve aqui para demonstrar
 * o kill switch; em produção este arquivo é substituído pelo provedor remoto.
 */
let serverFlags: FlagSnapshot = { ...defaultFlags };

export function readServerFlags(): FlagSnapshot {
  return { ...serverFlags };
}

export function writeServerFlag(key: FlagKey, value: boolean): void {
  serverFlags = { ...serverFlags, [key]: value };
}
