/** Saudação por faixa de horário. Lógica pura: sem Date.now escondido. */
export function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function longDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/** "Em 12 min" só aparece para a próxima consulta dentro da janela. */
export const IMMINENT_WINDOW_MINUTES = 30;

export function minutesUntil(iso: string, nowMs: number): number {
  return Math.round((Date.parse(iso) - nowMs) / 60_000);
}
