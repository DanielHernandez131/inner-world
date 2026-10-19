import type { Emotion } from '../../shared/contracts/generated';
import type { Experience } from '../../shared/storage/repository';

export function buildRegion(experiences: Experience[], emotion: Emotion) {
  const records = [...experiences]
    .filter((item) => item.analysis.emotions.some((reading) => reading.emotion === emotion))
    .sort((a, b) => b.confirmedAt.localeCompare(a.confirmedAt) || a.id.localeCompare(b.id));
  return { records, visible: records.slice(0, 3), overflow: Math.max(0, records.length - 3) };
}
