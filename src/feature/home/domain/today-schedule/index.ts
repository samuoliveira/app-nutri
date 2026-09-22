import type { Appointment } from '@/core/domain/model';
import { IMMINENT_WINDOW_MINUTES, minutesUntil, timeLabel } from '../greeting';
import type { TodayItem } from './types';

export type { TodayItem } from './types';

const KIND_LABEL: Record<Appointment['kind'], string> = {
  primeira: 'Primeira consulta',
  retorno: 'Retorno',
  consulta: 'Consulta',
};

export function buildTodayItems(
  appointments: ReadonlyArray<Appointment>,
  nowMs: number,
): ReadonlyArray<TodayItem> {
  return [...appointments]
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    .map((appointment) => {
      const minutes = minutesUntil(appointment.startsAt, nowMs);
      return {
        appointment,
        timeLabel: timeLabel(appointment.startsAt),
        kindLabel: KIND_LABEL[appointment.kind],
        minutesUntil: minutes >= 0 && minutes <= IMMINENT_WINDOW_MINUTES ? minutes : null,
      };
    });
}
