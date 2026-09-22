import type { Insight, Measurement, Patient } from '@/core/domain/model';
import { classify, classifyBloodPressure, glycemiaScale, measurementTrend } from '@/feature/biomarkers/domain';

/**
 * Fallback por regras: se a IA falhar, a nutricionista ainda recebe leitura
 * — com aviso de origem, nunca em silêncio.
 */
export function buildRuleInsight(
  patient: Patient,
  measurements: ReadonlyArray<Measurement>,
  nowISO: string = new Date().toISOString(),
): Insight {
  const glycemia = measurements.filter((measurement) => measurement.kind === 'glicemia');
  const pressure = measurements.filter((measurement) => measurement.kind === 'pressao');
  const weight = measurements.filter((measurement) => measurement.kind === 'peso');

  const latestGlycemia = glycemia[glycemia.length - 1];
  const trend = measurementTrend(glycemia);
  const reading = latestGlycemia ? classify(latestGlycemia.value, glycemiaScale) : null;

  const headline = reading && trend.direction === 'subindo'
    ? `A glicemia apresentou aumento nas últimas ${Math.min(glycemia.length, 3)} medições.`
    : reading
      ? `Glicemia dentro do esperado: ${reading.label.toLowerCase()}.`
      : 'Ainda não há medições suficientes para uma leitura.';

  const latestPressure = pressure[pressure.length - 1];
  const pressureReading = latestPressure
    ? classifyBloodPressure(latestPressure.value, latestPressure.secondaryValue ?? 0)
    : null;

  return {
    id: `rule-${patient.id}-${nowISO}`,
    patientId: patient.id,
    status: 'rascunho',
    headline,
    body: [
      headline,
      pressureReading ? `Pressão classificada como ${pressureReading.label.toLowerCase()}.` : null,
      weight.length > 1 ? `Peso com variação de ${measurementTrend(weight).percent}% na janela observada.` : null,
    ]
      .filter((line): line is string => line !== null)
      .join(' '),
    consideredData: [
      { label: 'Glicemia', detail: `${glycemia.length} medições` },
      { label: 'Peso', detail: `${weight.length} medições` },
      { label: 'Pressão arterial', detail: `${pressure.length} medições` },
    ],
    source: 'regras',
    createdAt: nowISO,
  };
}
