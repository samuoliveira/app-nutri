import type { SparklineGeometry } from './types';

/** Lógica pura da sparkline: fora do componente, testável sem render. */
export function sparklinePath(
  values: ReadonlyArray<number>,
  width: number,
  height: number,
  padding = 5,
): SparklineGeometry | null {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = (width - padding * 2) / (values.length - 1);
  const usableHeight = height - padding * 2 - 8;

  const points = values.map((value, index) => {
    const x = padding + stepX * index;
    const y = padding + (1 - (value - min) / span) * usableHeight;
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  const last = points[points.length - 1];
  if (!last) return null;

  return {
    d: points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' '),
    lastX: last.x,
    lastY: last.y,
  };
}
