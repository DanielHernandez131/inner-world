import { useState } from 'react';
import { WorldPreview } from '../features/world/WorldPreview';

const views = [
  { id: 'world', label: 'Mi mundo' },
  { id: 'mirror', label: 'Espejo' },
  { id: 'history', label: 'Historial' },
] as const;
type View = (typeof views)[number]['id'];

export function App() {
  const [view, setView] = useState<View>('world');

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Ir al contenido
      </a>
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            ✧
          </span>{' '}
          Inner World
        </div>
        <nav aria-label="Principal">
          {views.map((item) => (
            <button
              key={item.id}
              aria-current={view === item.id ? 'page' : undefined}
              onClick={() => setView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <span className="project-status">En desarrollo</span>
      </header>
      <main id="main">
        {view === 'world' ? (
          <>
            <section className="hero">
              <p className="eyebrow">CONTAR · COMPRENDER · VISUALIZAR · DESCUBRIR</p>
              <h1>
                Tu mundo comienza
                <br />
                <span>con una experiencia.</span>
              </h1>
              <p className="hero-copy">
                Un espacio para explorar lo que sientes y descubrir las huellas que deja en tu mundo
                interior.
              </p>
              <button className="primary-action" disabled aria-describedby="exploration-status">
                Explorar una experiencia
              </button>
              <p id="exploration-status" className="helper">
                La exploración con IA llegará en la siguiente fase.
              </p>
            </section>
            <WorldPreview />
            <section className="expansions" aria-label="Futuras experiencias">
              <article>
                <span className="eyebrow">En desarrollo</span>
                <h2>Mazmorra emocional</h2>
                <p>Explora situaciones a través de desafíos simbólicos.</p>
              </article>
              <article>
                <span className="eyebrow">En desarrollo</span>
                <h2>Alquimia emocional</h2>
                <p>Descubre perspectivas al combinar emociones.</p>
              </article>
            </section>
          </>
        ) : (
          <section className="empty-view" aria-live="polite">
            <p className="eyebrow">
              {view === 'mirror' ? 'Fragmentos y perspectivas' : 'Huellas de tus experiencias'}
            </p>
            <h1>
              {view === 'mirror'
                ? 'Tu Espejo está por descubrir.'
                : 'Cada experiencia tendrá su lugar.'}
            </h1>
            <p>
              Esta sección está en desarrollo. Aparecerán aquí los registros que decidas guardar.
            </p>
          </section>
        )}
      </main>
      <footer>Inner World · Un mundo por comprender · Proyecto open source</footer>
    </div>
  );
}
