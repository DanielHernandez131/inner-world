import type { Emotion } from '../contracts/generated';

export interface RegionDefinition {
  label: string;
  region: string;
  color: string;
  symbol: string;
}

// Artistic associations only. These are not psychological measurements.
export const regions: Record<Emotion, RegionDefinition> = {
  joy: { label: 'Alegría', region: 'Jardín luminoso', color: '#eed174', symbol: '✳' },
  trust: { label: 'Confianza', region: 'Refugio compartido', color: '#94c298', symbol: '⌂' },
  fear: { label: 'Miedo', region: 'Bosque de vigilancia', color: '#81b7b1', symbol: '♧' },
  surprise: { label: 'Sorpresa', region: 'Claro de los hallazgos', color: '#91bce2', symbol: '✧' },
  sadness: { label: 'Tristeza', region: 'Lago de los recuerdos', color: '#92a6db', symbol: '≈' },
  disgust: { label: 'Aversión', region: 'Jardín de los límites', color: '#c3a0d5', symbol: '◇' },
  anger: { label: 'Ira', region: 'Fortaleza de la energía', color: '#e7a090', symbol: '△' },
  anticipation: {
    label: 'Anticipación',
    region: 'Observatorio de caminos',
    color: '#e2b987',
    symbol: '↗',
  },
};
