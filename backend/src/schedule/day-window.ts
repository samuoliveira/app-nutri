/**
 * Regra pura: "hoje" é um intervalo, não um instante. Fica fora do service
 * para ser testável sem banco — e é o que evita consulta sumindo por fuso.
 */
export interface DayWindow {
  readonly start: Date;
  readonly end: Date;
}

export function dayWindow(dayIso: string): DayWindow {
  const reference = new Date(dayIso);
  if (Number.isNaN(reference.getTime())) throw new RangeError(`Data inválida: ${dayIso}`);

  const start = new Date(reference);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
}

export function isWithin(window: DayWindow, moment: Date): boolean {
  return moment >= window.start && moment < window.end;
}
