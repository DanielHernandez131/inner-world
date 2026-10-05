import type { CSSProperties } from 'react';
import { regions } from '../../shared/emotions/catalog';

export function WorldPreview() {
  return (
    <section className="regions" aria-label="Regiones del mundo emocional">
      {Object.entries(regions).map(([id, region]) => (
        <article
          key={id}
          className="region"
          style={{ '--region-color': region.color } as CSSProperties}
        >
          <span className="region-symbol" aria-hidden="true">
            {region.symbol}
          </span>
          <span className="eyebrow">{region.label}</span>
          <h2>{region.region}</h2>
          <p>Un lugar para las huellas de tus experiencias.</p>
        </article>
      ))}
    </section>
  );
}
