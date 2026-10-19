import { useState } from 'react';
import { buildRegion } from './buildWorld';
import type { Emotion } from '../../shared/contracts/generated';
import { regions } from '../../shared/emotions/catalog';
import type { Experience } from '../../shared/storage/repository';

// Fixed slots and stable ordering keep provider output out of SVG positions/styles.
export function WorldPreview({ experiences = [] }: { experiences?: Experience[] }) {
  const [selected, setSelected] = useState<Emotion>('joy');
  const { records: related } = buildRegion(experiences, selected);
  return (
    <section className="world-map" aria-label="Mapa emocional">
      <div className="map-heading">
        <div>
          <p className="eyebrow">UN PAISAJE QUE CRECE CONTIGO</p>
          <h2>Tu mundo interior</h2>
        </div>
        <span>{experiences.length} experiencias confirmadas</span>
      </div>
      <svg viewBox="0 0 960 570" role="img" aria-labelledby="map-title map-description">
        <title id="map-title">Ocho regiones de tu mundo emocional</title>
        <desc id="map-description">
          Las huellas representan experiencias confirmadas. Selecciona una región en los botones
          para consultar su origen.
        </desc>
        <defs>
          <radialGradient id="map-sea">
            <stop stopColor="#364057" />
            <stop offset="1" stopColor="#192231" />
          </radialGradient>
        </defs>
        <rect width="960" height="570" rx="32" fill="url(#map-sea)" />
        <path
          d="M90 280 Q220 40 460 85 Q770 25 885 280 Q820 500 480 505 Q170 550 90 280"
          fill="#283b40"
          stroke="#6c8280"
          strokeWidth="2"
        />
        <path
          d="M150 295 Q310 180 480 275 T820 300 M480 100 Q390 300 480 480"
          fill="none"
          stroke="#b6bec8"
          strokeWidth="2"
          strokeDasharray="5 10"
          opacity=".4"
        />
        {Object.entries(regions).map(([id, region], index) => {
          const angle = (index * Math.PI) / 4 - Math.PI / 2;
          const x = 480 + Math.cos(angle) * 300;
          const y = 285 + Math.sin(angle) * 175;
          const { records, visible, overflow } = buildRegion(experiences, id as Emotion);
          return (
            <g key={id} transform={`translate(${x},${y})`}>
              <ellipse
                rx="104"
                ry="68"
                fill={region.color}
                fillOpacity={records.length ? '.23' : '.08'}
                stroke={region.color}
                strokeOpacity={selected === id ? '1' : '.3'}
                strokeWidth={selected === id ? 3 : 1}
              />
              <text textAnchor="middle" y="-20" fill={region.color} fontSize="30">
                {region.symbol}
              </text>
              <text textAnchor="middle" y="8" fill="#f2f3f7" fontSize="14">
                {region.label}
              </text>
              {visible.map((experience, slot) => {
                const intensity = experience.analysis.emotions.find(
                  (item) => item.emotion === id,
                )!.intensity;
                return (
                  <g key={`${experience.id}:${id}`}>
                    <title>{experience.analysis.summary}</title>
                    <path
                      d={`M${-28 + slot * 28} 39 l6 -12 l6 12 l-6 9 z`}
                      fill={region.color}
                      opacity={0.5 + intensity * 0.05}
                    />
                  </g>
                );
              })}
              {overflow > 0 && (
                <text x="55" y="43" fill={region.color} fontSize="12">
                  +{overflow}
                </text>
              )}
            </g>
          );
        })}
        <text x="480" y="280" textAnchor="middle" fill="#d7c5fa" fontSize="27">
          ✧
        </text>
        <text x="480" y="307" textAnchor="middle" fill="#f2f3f7" fontSize="13">
          Tu experiencia
        </text>
      </svg>
      <div className="region-selector" aria-label="Consultar región">
        {(Object.keys(regions) as Emotion[]).map((id) => (
          <button key={id} aria-pressed={selected === id} onClick={() => setSelected(id)}>
            {regions[id].symbol} {regions[id].label}
          </button>
        ))}
      </div>
      <div className="region-detail" aria-live="polite">
        <h3>{regions[selected].region}</h3>
        {related.length ? (
          related.map((experience) => (
            <p key={experience.id}>
              <strong>{new Date(experience.confirmedAt).toLocaleDateString('es')}:</strong>{' '}
              {experience.analysis.summary}
            </p>
          ))
        ) : (
          <p>
            Aquí aparecerán las huellas de las experiencias que confirmes con{' '}
            {regions[selected].label.toLocaleLowerCase('es')}.
          </p>
        )}
        <p className="helper">
          Todas las emociones construyen. El paisaje es una representación simbólica, sin puntuación
          de bienestar.
        </p>
      </div>
    </section>
  );
}
