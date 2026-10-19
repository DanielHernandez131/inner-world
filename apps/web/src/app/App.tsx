import { useEffect, useState } from 'react';
import { Adventure } from '../features/adventure/Adventure';
import { WorldPreview } from '../features/world/WorldPreview';
import { Exploration } from '../features/exploration/Exploration';
import { repository, type Draft, type Experience } from '../shared/storage/repository';

const views = [
  { id: 'world', label: 'Mi mundo' },
  { id: 'explore', label: 'Explorar' },
  { id: 'adventure', label: 'Aventura' },
  { id: 'mirror', label: 'Espejo' },
  { id: 'history', label: 'Historial' },
] as const;
type View = (typeof views)[number]['id'];

export function App() {
  const [view, setView] = useState<View>('world');
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [available, setAvailable] = useState<boolean | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [adventureExperienceId, setAdventureExperienceId] = useState<string | null>(null);
  const [adventureLocked, setAdventureLocked] = useState(false);
  const adventureExperience =
    experiences.find((item) => item.id === adventureExperienceId) ?? experiences[0];
  const [explorationKey, setExplorationKey] = useState(0);
  useEffect(() => {
    let active = true;
    Promise.all([repository.listExperiences(), repository.getDraft()])
      .then(([items, current]) => {
        if (active) {
          setExperiences(items);
          setDraft(current);
          setReady(true);
        }
      })
      .catch((cause) => {
        if (active)
          setStorageError(
            cause instanceof Error ? cause.message : 'No se pudo leer el almacenamiento local.',
          );
      });
    fetch('/api/v1/health')
      .then((response) => response.json())
      .then((data) => {
        if (active) setAvailable(data.ai_enabled === true);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  async function remove(id: string) {
    try {
      await repository.deleteExperience(id);
      setExperiences((items) => items.filter((item) => item.id !== id));
      setDeleting(null);
    } catch {
      setStorageError('No se pudo eliminar la experiencia. Tus datos siguen disponibles.');
    }
  }
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
        <span className="project-status">Exploración inicial</span>
      </header>
      <main id="main">
        {storageError && <p role="alert">{storageError}</p>}
        {view === 'world' && (
          <>
            <section className="hero">
              <p className="eyebrow">CONTAR · COMPRENDER · VISUALIZAR · DESCUBRIR</p>
              <h1>
                Tu mundo comienza
                <br />
                <span>con una experiencia.</span>
              </h1>
              <p className="hero-copy">
                Explora lo que sientes con preguntas breves. Revisa lo que descubras y decide qué
                huellas dejar en tu mundo interior.
              </p>
              <button className="primary-action" onClick={() => setView('explore')}>
                {draft ? 'Continuar mi exploración' : 'Explorar una experiencia'}
              </button>
              <p className="helper">
                Tus registros se guardan en este navegador. El análisis utiliza OpenAI.
              </p>
            </section>
            <WorldPreview experiences={experiences} />
          </>
        )}
        <div hidden={view !== 'explore'}>
          {ready ? (
            <Exploration
              key={explorationKey}
              initial={draft}
              available={available}
              onSaved={(experience) => {
                setExperiences((items) => [
                  ...items.filter((item) => item.id !== experience.id),
                  experience,
                ]);
                setDraft(null);
                setExplorationKey((value) => value + 1);
                setView('world');
              }}
            />
          ) : (
            <p role="status">
              {storageError
                ? 'La exploración necesita acceso al almacenamiento local.'
                : 'Recuperando tu borrador…'}
            </p>
          )}
        </div>
        <section hidden={view !== 'adventure'} className="adventure-view">
          <p className="eyebrow">OTRA FORMA DE EXPLORAR</p>
          <h1>Un pequeño viaje interior.</h1>
          <p>Historias simbólicas con detalles personalizados. Elige tu camino a tu ritmo.</p>
          {!experiences.length && (
            <>
              <p>Primero explora y confirma una experiencia para darle un origen a tu aventura.</p>
              <button className="primary-action" onClick={() => setView('explore')}>
                Explorar una experiencia
              </button>
            </>
          )}
          {adventureExperience && (
            <>
              <label htmlFor="adventure-source">Experiencia para esta aventura</label>
              <select
                id="adventure-source"
                value={adventureExperience.id}
                disabled={adventureLocked}
                onChange={(event) => setAdventureExperienceId(event.target.value)}
              >
                {experiences.map((item) => (
                  <option key={item.id} value={item.id}>
                    {new Date(item.confirmedAt).toLocaleDateString('es')} · {item.analysis.summary}
                  </option>
                ))}
              </select>
              <Adventure
                key={adventureExperience.id}
                experience={adventureExperience}
                available={available}
                onPendingChange={setAdventureLocked}
                onChange={(session) =>
                  setExperiences((items) =>
                    items.map((item) =>
                      item.id === session.experienceId ? { ...item, adventure: session } : item,
                    ),
                  )
                }
              />
            </>
          )}
        </section>
        {view === 'history' && (
          <section className="empty-view">
            <p className="eyebrow">HUELLAS DE TUS EXPERIENCIAS</p>
            <h1>Tu historial</h1>
            {!experiences.length && <p>Aquí aparecerán las experiencias que decidas confirmar.</p>}
            {experiences.map((experience) => (
              <article className="history-entry" key={experience.id}>
                <h2>{experience.analysis.summary}</h2>
                <p>{new Date(experience.confirmedAt).toLocaleString('es')}</p>
                <details>
                  <summary>Ver relato y aclaraciones</summary>
                  <p className="story-text">{experience.draft.request.story.text}</p>
                  {experience.draft.request.answers.map((answer) => (
                    <p key={answer.message.id}>
                      {answer.question.text}
                      <br />
                      {answer.message.text}
                    </p>
                  ))}
                </details>
                {deleting === experience.id ? (
                  <>
                    <p>¿Eliminar esta experiencia, sus huellas, fragmentos y aventura?</p>
                    <button
                      disabled={adventureLocked && adventureExperience?.id === experience.id}
                      onClick={() => void remove(experience.id)}
                    >
                      Sí, eliminar
                    </button>
                    <button onClick={() => setDeleting(null)}>Conservar</button>
                  </>
                ) : (
                  <button
                    disabled={adventureLocked && adventureExperience?.id === experience.id}
                    onClick={() => setDeleting(experience.id)}
                  >
                    Eliminar experiencia
                  </button>
                )}
              </article>
            ))}
          </section>
        )}
        {view === 'mirror' && (
          <section className="empty-view">
            <p className="eyebrow">FRAGMENTOS Y PERSPECTIVAS</p>
            <h1>Tu Espejo</h1>
            <p>
              {experiences.length} experiencias confirmadas. Cada fragmento conserva su origen; no
              inferimos patrones a partir de un relato.
            </p>
            {experiences.flatMap((experience) =>
              experience.analysis.fragments.map((fragment, index) => (
                <article className="history-entry" key={`${experience.id}:${index}`}>
                  <p className="eyebrow">
                    {fragment.provenance === 'ai_hypothesis'
                      ? 'Hipótesis IA'
                      : fragment.provenance === 'user_quote'
                        ? 'Tus palabras'
                        : 'Paráfrasis'}
                  </p>
                  <p>{fragment.text}</p>
                  <details>
                    <summary>
                      Experiencia de origen ·{' '}
                      {new Date(experience.confirmedAt).toLocaleDateString('es')}
                    </summary>
                    <p>{experience.draft.request.story.text}</p>
                  </details>
                </article>
              )),
            )}
          </section>
        )}
      </main>
      <footer>Inner World · Un mundo por comprender · Proyecto open source</footer>
    </div>
  );
}
