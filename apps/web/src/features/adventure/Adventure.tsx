import { useEffect, useRef, useState } from 'react';
import { ApiRequestError, postJson } from '../../shared/api/client';
import { repository, type Experience } from '../../shared/storage/repository';
import {
  choose,
  currentScene,
  isAdventureResponse,
  reflect,
  scenes,
  type AdventureSession,
  type Reflection,
} from './model';

const reflectionLabels: Record<Reflection, string> = {
  connects: 'Sí, hay algo que me representa',
  fiction_only: 'Ha sido solo una elección dentro del juego',
  uncertain: 'Todavía no lo sé',
};
function now() {
  return Date.now();
}

export function Adventure({
  experience,
  available,
  onChange,
  onPendingChange,
}: {
  experience: Experience;
  available: boolean | null;
  onChange: (session: AdventureSession) => void;
  onPendingChange: (pending: boolean) => void;
}) {
  const [session, setSession] = useState<AdventureSession | null>(experience.adventure ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [unsaved, setUnsaved] = useState(false);
  const [consent, setConsent] = useState(false);
  useEffect(() => {
    onPendingChange(busy || unsaved);
  }, [busy, unsaved, onPendingChange]);
  const lock = useRef(false);
  const retryAt = useRef(0);
  let sceneId: ReturnType<typeof currentScene> | null = null;
  let restoreError = '';
  try {
    if (session) {
      if (!isAdventureResponse(session.response, experience.id))
        throw new Error('No podemos leer la aventura guardada. Conservamos sus datos.');
      sceneId = currentScene(session);
    }
  } catch (cause) {
    restoreError = cause instanceof Error ? cause.message : 'No podemos recuperar esta aventura.';
  }

  async function store(next: AdventureSession) {
    await repository.saveAdventure(experience.id, next);
    setSession(next);
    setUnsaved(false);
    onChange(next);
  }
  async function start() {
    if (lock.current || session || !consent) return;
    if (now() < retryAt.current) {
      setError('Espera un minuto antes de volver a intentarlo.');
      return;
    }
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const data = await postJson<unknown>(
        '/api/v1/adventures/personalize',
        {
          experience_id: experience.id,
          template_id: 'crossing-v1',
          summary: experience.analysis.summary,
          emotions: experience.analysis.emotions.map((item) => item.emotion),
        },
        35000,
      );
      if (!isAdventureResponse(data, experience.id))
        throw new Error('La respuesta de personalización no es válida.');
      const next: AdventureSession = {
        schemaVersion: 1,
        experienceId: experience.id,
        createdAt: new Date().toISOString(),
        response: data,
        choices: [],
        reflection: null,
      };
      // Keep the paid result in memory even if local storage fails; retry saving, not generation.
      setSession(next);
      setUnsaved(true);
      await store(next);
    } catch (cause) {
      if (cause instanceof ApiRequestError && cause.retryAfterMs)
        retryAt.current = now() + cause.retryAfterMs;
      setError(
        cause instanceof Error ? cause.message : 'No hay conexión. Puedes volver a intentarlo.',
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function persist(next: AdventureSession) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      await store(next);
    } catch {
      setError('No se pudo guardar el avance. Mantén esta pestaña abierta y reintenta.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  const content = !restoreError ? session?.response?.personalization : undefined;
  const scene = sceneId ? scenes[sceneId] : null;
  const detail =
    content && sceneId
      ? {
          threshold: content.introduction,
          clearing: content.clearing_detail,
          shelter: content.shelter_detail,
          bridge: '',
          arrival: content.arrival_detail,
        }[sceneId]
      : '';
  return (
    <article className="adventure-panel" aria-labelledby="adventure-title">
      <p className="eyebrow">AVENTURA HÍBRIDA · UNA PERSONALIZACIÓN, MUCHOS PASOS</p>
      <h2 id="adventure-title">{content?.title ?? 'El bosque de los caminos'}</h2>
      <details>
        <summary>Experiencia de origen</summary>
        <p>{experience.analysis.summary}</p>
      </details>
      {!session && (
        <>
          <p>
            Un bosque, un refugio y una torre desde la que mirar. Una historia breve adaptada a tu
            experiencia, sin respuestas correctas ni puntuaciones.
          </p>
          <label className="consent">
            <input
              type="checkbox"
              checked={consent}
              disabled={busy}
              onChange={(event) => setConsent(event.target.checked)}
            />{' '}
            Enviar a OpenAI el resumen confirmado y las emociones para personalizar esta aventura.
          </label>
          <p className="helper">
            Se realiza una llamada de IA. Las decisiones y el cierre funcionan después sin nuevas
            llamadas. No enviamos de nuevo el relato ni las aclaraciones.{' '}
            <a
              href="https://developers.openai.com/api/docs/guides/your-data"
              target="_blank"
              rel="noreferrer"
            >
              Tratamiento de datos
            </a>
            .
          </p>
          {available === false && (
            <p>Configura la clave y el modelo de OpenAI en el backend para comenzar.</p>
          )}
          <button
            className="primary-action"
            disabled={
              busy || !consent || available === false || experience.analysis.emotions.length === 0
            }
            onClick={() => void start()}
          >
            Personalizar y comenzar
          </button>
          {experience.analysis.emotions.length === 0 && (
            <p>
              Esta experiencia necesita al menos una emoción confirmada para iniciar la aventura.
            </p>
          )}
        </>
      )}
      {restoreError && <p role="alert">{restoreError}</p>}
      {session && scene && !restoreError && (
        <>
          <svg
            className="adventure-landscape"
            viewBox="0 0 760 220"
            role="img"
            aria-label="Un sendero entre el bosque, el refugio y una torre"
          >
            <rect width="760" height="220" rx="20" fill="#202e40" />
            <circle cx="590" cy="46" r="24" fill="#e2d2a1" />
            <path d="M0 170 Q170 100 360 165 T760 140 V220 H0Z" fill="#38544d" />
            <path d="M190 220 Q410 160 555 130" fill="none" stroke="#cbb8a0" strokeWidth="18" />
            {[65, 105, 145, 230, 300].map((x, index) => (
              <path key={x} d={`M${x} ${90 + (index % 2) * 18} l-26 75 h52 Z`} fill="#75938b" />
            ))}
            <path d="M375 150 V113 H433 V150 M365 113 L404 86 L443 113Z" fill="#b7a398" />
            <path d="M547 135 V62 H585 V135 M541 62 L566 41 L591 62Z" fill="#a8aec6" />
            <circle
              cx={
                sceneId === 'arrival'
                  ? 565
                  : sceneId === 'bridge'
                    ? 495
                    : sceneId === 'shelter'
                      ? 404
                      : sceneId === 'clearing'
                        ? 340
                        : 230
              }
              cy="180"
              r="7"
              fill="#e8d8ff"
            />
          </svg>
          <p className="eyebrow">
            {sceneId === 'arrival' ? 'LLEGADA' : `ESCENA ${session.choices.length + 1}`} · SIN
            NUEVAS LLAMADAS DE IA
          </p>
          <h3 tabIndex={-1}>{scene.title}</h3>
          <p>{scene.text}</p>
          <p>{detail}</p>
          <div className="answer-options">
            {scene.choices.map((choice) => (
              <button
                key={choice.id}
                disabled={busy || unsaved}
                onClick={() => void persist(choose(session, choice.id))}
              >
                {choice.label}
              </button>
            ))}
          </div>
          {sceneId === 'arrival' && (
            <div className="adventure-reflection">
              <h3>Volver a tu experiencia</h3>
              <p>{content?.reflection_question}</p>
              <p className="helper">
                Elegir dentro de una ficción no demuestra cómo reaccionas en la vida real. Esta
                reflexión se guarda aparte y no cambia tus emociones ni tu mapa.
              </p>
              {Object.entries(reflectionLabels).map(([id, label]) => (
                <button
                  key={id}
                  aria-pressed={session.reflection === id}
                  disabled={busy || unsaved}
                  onClick={() => void persist(reflect(session, id as Reflection))}
                >
                  {label}
                </button>
              ))}
              {session.reflection && (
                <p role="status">Reflexión guardada: {reflectionLabels[session.reflection]}</p>
              )}
            </div>
          )}
          <details>
            <summary>Tu recorrido por la historia</summary>
            <ol>
              {session.choices.map((step) => (
                <li key={step.sceneId}>
                  {scenes[step.sceneId].title}:{' '}
                  {scenes[step.sceneId].choices.find((item) => item.id === step.choiceId)?.label}
                </li>
              ))}
            </ol>
          </details>
          <p className="helper">
            {session.response.usage
              ? `Personalización: ${session.response.usage.input_tokens} tokens de entrada y ${session.response.usage.output_tokens} de salida.`
              : 'El proveedor no informó del consumo de tokens.'}{' '}
            Retomar esta aventura utiliza el contenido guardado.
          </p>
        </>
      )}
      {unsaved && (
        <>
          <p role="alert">
            La aventura está en esta pestaña, pero aún no se ha guardado. No cierres ni cambies de
            experiencia.
          </p>
          <button disabled={busy} onClick={() => session && void persist(session)}>
            Reintentar guardado sin usar IA
          </button>
        </>
      )}
      {busy && (
        <p role="status">{session ? 'Guardando tu recorrido…' : 'Personalizando tu historia…'}</p>
      )}
      {error && (
        <p role="alert">
          {error}
          {!session &&
            ' Si hubo una interrupción después del envío, reintentar podría generar otra llamada facturable.'}
        </p>
      )}
    </article>
  );
}
