import type { AdventureResponse } from '../../shared/contracts/adventure-response';

export interface AdventureChoice {
  id: string;
  label: string;
  next: SceneId;
}
export type SceneId = 'threshold' | 'clearing' | 'shelter' | 'bridge' | 'arrival';
export type Reflection = 'connects' | 'fiction_only' | 'uncertain';
export interface AdventureSession {
  schemaVersion: 1;
  experienceId: string;
  createdAt: string;
  response: AdventureResponse;
  choices: { sceneId: SceneId; choiceId: string }[];
  reflection: Reflection | null;
}
export const scenes: Record<SceneId, { title: string; text: string; choices: AdventureChoice[] }> =
  {
    threshold: {
      title: 'El umbral',
      text: 'Ante ti se abre un sendero. No hay prisa ni un camino que debas elegir.',
      choices: [
        { id: 'observe', label: 'Observar el sendero', next: 'clearing' },
        { id: 'company', label: 'Acercarme a un refugio', next: 'shelter' },
      ],
    },
    clearing: {
      title: 'Un claro entre los árboles',
      text: 'La luz deja ver un puente a lo lejos y un pequeño refugio a un lado. Puedes elegir qué explorar.',
      choices: [
        { id: 'small_step', label: 'Preparar un paso pequeño hacia el puente', next: 'bridge' },
        { id: 'shelter', label: 'Visitar primero el refugio', next: 'shelter' },
      ],
    },
    shelter: {
      title: 'El refugio',
      text: 'Una persona que cuida el lugar señala el puente. Puedes conversar o seguir mirando el paisaje.',
      choices: [
        { id: 'ask', label: 'Pedir una orientación antes de continuar', next: 'bridge' },
        { id: 'own_pace', label: 'Continuar a mi ritmo', next: 'bridge' },
      ],
    },
    bridge: {
      title: 'Un puente de madera',
      text: 'El puente es firme. Al otro lado hay una torre abierta al paisaje. Aquí puedes decidir el ritmo del último tramo.',
      choices: [
        { id: 'cross', label: 'Cruzar despacio, mirando alrededor', next: 'arrival' },
        { id: 'pause', label: 'Hacer una pausa y después cruzar', next: 'arrival' },
      ],
    },
    arrival: {
      title: 'Un lugar desde el que mirar',
      text: 'Desde la torre se ven los caminos que has recorrido. No hay una elección ganadora: cada recorrido ha tenido su propio ritmo.',
      choices: [],
    },
  };

export function currentScene(session: AdventureSession): SceneId {
  if (
    session.schemaVersion !== 1 ||
    session.response.template_id !== 'crossing-v1' ||
    session.response.experience_id !== session.experienceId
  )
    throw new Error('Esta aventura usa una versión o un origen que no podemos recuperar.');
  let current: SceneId = 'threshold';
  if (!Array.isArray(session.choices) || session.choices.length > 4)
    throw new Error('El recorrido guardado no es válido.');
  for (const step of session.choices) {
    const choice: AdventureChoice | undefined = scenes[current].choices.find(
      (item) => item.id === step.choiceId,
    );
    if (step.sceneId !== current || !choice) throw new Error('El recorrido guardado no es válido.');
    current = choice.next;
  }
  if (
    session.reflection !== null &&
    (!['connects', 'fiction_only', 'uncertain'].includes(session.reflection) ||
      current !== 'arrival')
  )
    throw new Error('La reflexión guardada no es válida.');
  return current;
}
export function choose(session: AdventureSession, choiceId: string): AdventureSession {
  const sceneId = currentScene(session);
  if (!scenes[sceneId].choices.some((item) => item.id === choiceId))
    throw new Error('Esa elección no está disponible en esta escena.');
  return { ...session, choices: [...session.choices, { sceneId, choiceId }] };
}
export function reflect(session: AdventureSession, reflection: Reflection): AdventureSession {
  if (currentScene(session) !== 'arrival')
    throw new Error('Termina el recorrido antes de guardar tu reflexión.');
  return { ...session, reflection };
}

export function isAdventureResponse(
  value: unknown,
  experienceId: string,
): value is AdventureResponse {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  if (
    data.experience_id !== experienceId ||
    data.template_id !== 'crossing-v1' ||
    typeof data.request_id !== 'string' ||
    !data.personalization ||
    typeof data.personalization !== 'object'
  )
    return false;
  const content = data.personalization as Record<string, unknown>;
  const limits = {
    title: 80,
    introduction: 600,
    clearing_detail: 220,
    shelter_detail: 220,
    arrival_detail: 220,
    reflection_question: 200,
  };
  if (
    !Object.entries(limits).every(
      ([key, limit]) =>
        typeof content[key] === 'string' &&
        content[key].trim().length > 0 &&
        content[key].length <= limit,
    )
  )
    return false;
  if (data.usage === null) return true;
  if (!data.usage || typeof data.usage !== 'object') return false;
  const usage = data.usage as Record<string, unknown>;
  return ['input_tokens', 'output_tokens'].every(
    (key) => Number.isSafeInteger(usage[key]) && (usage[key] as number) >= 0,
  );
}
