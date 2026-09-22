import type { Appointment } from '@/core/domain/model';

export interface TodayItem {
  readonly appointment: Appointment;
  readonly timeLabel: string;
  readonly kindLabel: string;
  readonly minutesUntil: number | null;
}
