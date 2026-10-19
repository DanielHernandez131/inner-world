import { useRef, useState } from 'react';
import { ApiRequestError, postJson } from '../../shared/api/client';
import type { ExplorationRequest } from '../../shared/contracts/exploration-request';
import type { ExplorationResponse } from '../../shared/contracts/exploration-response';
import type { EmotionalAnalysis } from '../../shared/contracts/generated';
import { regions } from '../../shared/emotions/catalog';
import { repository, type Draft, type Experience } from '../../shared/storage/repository';

function now() {
  return Date.now();
}

function newDraft(): Draft {
  return {
    schemaVersion: 1,
    request: {
      experience_id: crypto.randomUUID(),
      story: { id: crypto.randomUUID(), text: '' },
      answers: [],
      finish_now: false,
    },
    response: null,
  };
}
export function Exploration({
  initial,
  onSaved,
  available,
}: {
  initial: Draft | null;
  onSaved: (experience: Experience) => void;
  available: boolean | null;
}) {
  const [draft, setDraft] = useState<Draft>(() => initial ?? newDraft());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const custom = draft.answerText ?? '';
  const [consent, setConsent] = useState(false);
  const [retry, setRetry] = useState<ExplorationRequest | null>(null);
  const [retryAt, setRetryAt] = useState(0);
  const lock = useRef(false);
  const writes = useRef<Promise<unknown>>(Promise.resolve());
  const result = draft.response?.result;
  const analysis = result?.status === 'complete' ? result.analysis : null;

  function persist(next: Draft) {
    writes.current = writes.current.catch(() => {}).then(() => repository.saveDraft(next));
    return writes.current;
  }
  async function update(next: Draft) {
    setDraft(next);
    try {
      await persist(next);
    } catch {
      setError(
        'No se pudo guardar el borrador. Mantén esta pestaña abierta y vuelve a intentarlo.',
      );
    }
  }
  async function send(request: ExplorationRequest) {
    if (lock.current) return;
    if (now() < retryAt) {
      setError('Espera un minuto antes de reintentar.');
      return;
    }
    lock.current = true;
    setBusy(true);
    setError('');
    setRetry(request);
    const next: Draft = { schemaVersion: 1, request, response: null };
    setDraft(next);
    try {
      await persist(next);
      const data = await postJson<ExplorationResponse>(
        '/api/v1/explorations/analyze',
        request,
        70000,
      );
      if (
        !data.result ||
        !['clarification', 'complete', 'insufficient_context'].includes(data.result.status)
      )
        throw new Error('La respuesta de IA no es válida.');
      await update({ ...next, response: data as ExplorationResponse });
      setRetry(null);
    } catch (cause) {
      if (cause instanceof ApiRequestError && cause.retryAfterMs)
        setRetryAt(now() + cause.retryAfterMs);
      setError(
        cause instanceof Error ? cause.message : 'No hay conexión. Tu borrador se conserva.',
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function answer(text: string) {
    if (result?.status !== 'clarification' || draft.request.answers.length >= 2) return;
    void send({
      ...draft.request,
      answers: [
        ...draft.request.answers,
        { question: result.question, message: { id: crypto.randomUUID(), text } },
      ],
    });
  }
  async function save() {
    if (!shown || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    const experience: Experience = {
      id: draft.request.experience_id,
      confirmedAt: new Date().toISOString(),
      draft,
      analysis: shown,
    };
    try {
      await persist(draft);
      await repository.confirmExperience(experience);
      onSaved(experience);
    } catch {
      setError('No se pudo guardar la experiencia. Puedes reintentar sin duplicarla.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function revise(next: EmotionalAnalysis) {
    void update({ ...draft, reviewed: next });
  }
  const shown = draft.reviewed ?? analysis;

  return (
    <section className="exploration" aria-labelledby="exploration-title">
      <p className="eyebrow">
        EXPLORACIÓN ·{' '}
        {analysis
          ? 'REVISA TU INTERPRETACIÓN'
          : `PASO ${draft.request.answers.length + 1} DE HASTA 3`}
      </p>
      <h1 id="exploration-title">Dale espacio a lo que sientes.</h1>
      <p>Una experiencia, algunas aclaraciones y una perspectiva que tú decides si encaja.</p>
      {available === false && (
        <p role="status">La IA necesita configuración en el backend: clave y modelo de OpenAI.</p>
      )}
      {!result && !retry && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void send(draft.request);
          }}
        >
          <label htmlFor="story">¿Qué ha ocurrido y cómo lo has vivido?</label>
          <textarea
            id="story"
            minLength={20}
            maxLength={4000}
            required
            value={draft.request.story.text}
            disabled={busy}
            onChange={(event) => {
              void update({
                ...draft,
                request: {
                  ...draft.request,
                  story: { ...draft.request.story, text: event.target.value },
                },
              });
            }}
          />
          <p className="helper">
            {draft.request.story.text.length}/4000 · Se guarda como borrador en este navegador.
          </p>
          <label className="consent">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
              required
            />{' '}
            Entiendo que el relato y mis respuestas se enviarán a OpenAI para esta exploración.
          </label>
          <p className="helper">
            El backend no guarda tus relatos. OpenAI puede conservar registros de seguridad hasta 30
            días según la configuración de la cuenta.{' '}
            <a
              href="https://developers.openai.com/api/docs/guides/your-data"
              target="_blank"
              rel="noreferrer"
            >
              Tratamiento de datos
            </a>
            . No es un diagnóstico.
          </p>
          <button className="primary-action" disabled={busy || !consent || available === false}>
            Comenzar exploración
          </button>
        </form>
      )}
      {draft.request.answers.length > 0 && (
        <details>
          <summary>Tus aclaraciones</summary>
          {draft.request.answers.map((answer) => (
            <div key={answer.message.id}>
              <p>{answer.question.text}</p>
              <blockquote>{answer.message.text}</blockquote>
            </div>
          ))}
        </details>
      )}
      {result?.status === 'clarification' && (
        <div>
          <h2>{result.question.text}</h2>
          <div className="answer-options">
            {result.question.options.map((option) => (
              <button key={option} disabled={busy} onClick={() => answer(option)}>
                {option}
              </button>
            ))}
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              answer(custom.trim());
            }}
          >
            <label htmlFor="custom">Otra respuesta o un matiz</label>
            <textarea
              id="custom"
              value={custom}
              maxLength={2000}
              disabled={busy}
              onChange={(event) => {
                void update({ ...draft, answerText: event.target.value });
              }}
            />
            <button disabled={busy || !custom.trim()}>Responder con mis palabras</button>
          </form>
          <button disabled={busy} onClick={() => void send({ ...draft.request, finish_now: true })}>
            Terminar con lo que he contado
          </button>
        </div>
      )}
      {result?.status === 'insufficient_context' && (
        <>
          <p>{result.explanation}</p>
          <button
            onClick={() => {
              setRetry(null);
              void update({
                schemaVersion: 1,
                response: null,
                request: { ...draft.request, answers: [], finish_now: false },
              });
            }}
          >
            Ampliar mi relato
          </button>
        </>
      )}
      {shown && (
        <div className="review">
          <h2>Una interpretación posible</h2>
          <p>{shown.summary}</p>
          <p className="helper">
            Ajusta la intensidad o retira las emociones que no encajen. Las voces y fragmentos son
            perspectivas revisables.
          </p>
          {shown.emotions.map((emotion) => (
            <div className="emotion-review" key={emotion.emotion}>
              <h3>{regions[emotion.emotion].label}</h3>
              <p>{emotion.explanation}</p>
              {emotion.evidence.map((evidence, index) => (
                <blockquote key={index}>«{evidence.quote}»</blockquote>
              ))}
              <label>
                Intensidad propuesta: {emotion.intensity}/10{' '}
                <input
                  type="range"
                  disabled={busy}
                  min="1"
                  max="10"
                  value={emotion.intensity}
                  onChange={(event) =>
                    revise({
                      ...shown,
                      emotions: shown.emotions.map((item) =>
                        item.emotion === emotion.emotion
                          ? { ...item, intensity: Number(event.target.value) }
                          : item,
                      ),
                    })
                  }
                />
              </label>
              <button
                disabled={busy}
                onClick={() =>
                  revise({
                    ...shown,
                    emotions: shown.emotions.filter((item) => item.emotion !== emotion.emotion),
                    characters: shown.characters.filter((item) => item.emotion !== emotion.emotion),
                    fragments: shown.fragments.map((item) => ({
                      ...item,
                      related_emotions: item.related_emotions.filter(
                        (id) => id !== emotion.emotion,
                      ),
                    })),
                  })
                }
              >
                No me representa
              </button>
            </div>
          ))}
          {shown.characters.map((voice) => (
            <p key={voice.emotion}>
              <strong>Perspectiva de {regions[voice.emotion].label}:</strong> {voice.text}
            </p>
          ))}
          {shown.fragments.map((fragment, index) => (
            <p key={index}>
              <strong>
                {fragment.provenance === 'ai_hypothesis'
                  ? 'Hipótesis IA'
                  : fragment.provenance === 'user_quote'
                    ? 'Tus palabras'
                    : 'Paráfrasis de tu relato'}
                :
              </strong>{' '}
              {fragment.text}
            </p>
          ))}
          <button className="primary-action" disabled={busy} onClick={() => void save()}>
            Confirmar y dejar huellas en mi mundo
          </button>
        </div>
      )}
      {busy && <p role="status">Preparando tu exploración…</p>}
      {error && (
        <div role="alert">
          <p>{error}</p>
          {retry && (
            <button disabled={busy} onClick={() => void send(retry)}>
              Reintentar
            </button>
          )}
        </div>
      )}
      {retry && !busy && (
        <button
          onClick={() => {
            setRetry(null);
            void update({
              ...draft,
              response: null,
              request: { ...draft.request, answers: [], finish_now: false },
            });
          }}
        >
          Volver al relato
        </button>
      )}
    </section>
  );
}
