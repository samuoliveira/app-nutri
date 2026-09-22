/** Lógica pura da faixa de referência: valor → posição 0..1 dentro da escala desenhada. */
export function progressClamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || max <= min) return 0;
  return Math.min(1, Math.max(0, (value - min) / (max - min)));
}
