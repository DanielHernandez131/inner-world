export class ApiRequestError extends Error {
  retryAfterMs: number;
  constructor(message: string, retryAfterMs = 0) {
    super(message);
    this.name = 'ApiRequestError';
    this.retryAfterMs = retryAfterMs;
  }
}

export async function postJson<T>(path: string, payload: unknown, timeoutMs: number): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (cause) {
    if (cause instanceof Error && ['TimeoutError', 'AbortError'].includes(cause.name)) {
      throw new ApiRequestError(
        'La solicitud ha tardado demasiado. Conservamos tu borrador. Reintentar puede generar otra llamada de IA si la anterior llegó al servidor.',
      );
    }
    throw new ApiRequestError(
      'No se pudo conectar con la API. Abre la app en http://127.0.0.1:5173 y comprueba que el backend esté iniciado con npm run dev:api. Conservamos tu borrador.',
    );
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    let message =
      'La API no está disponible. Comprueba que el backend esté iniciado y vuelve a intentarlo.';
    if (
      data &&
      typeof data === 'object' &&
      'error' in data &&
      data.error &&
      typeof data.error === 'object' &&
      'message' in data.error &&
      typeof data.error.message === 'string'
    )
      message = data.error.message;
    const seconds = Number(response.headers.get('Retry-After') || 60);
    throw new ApiRequestError(
      message,
      response.status === 429
        ? (Number.isFinite(seconds) && seconds >= 0 ? seconds : 60) * 1000
        : 0,
    );
  }
  if (!data || typeof data !== 'object')
    throw new ApiRequestError(
      'La API no devolvió una respuesta válida. Comprueba que estás usando http://127.0.0.1:5173 y que el backend está iniciado.',
    );
  return data as T;
}
