/**
 * Result-Pattern für Fehlerbehandlung
 */
export type Result<T, E = string> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

/**
 * Erstellt ein erfolgreiches Result
 */
export function ok<T>(data: T): Result<T, never> {
  return {
    success: true,
    data
  };
}

/**
 * Erstellt ein fehlerhaftes Result
 */
export function err<E = string>(error: E): Result<never, E> {
  return {
    success: false,
    error
  };
}

/**
 * Prüft, ob ein Result ein Fehler ist
 */
export function isErr<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return !result.success;
}

/**
 * Prüft, ob ein Result erfolgreich ist
 */
export function isOk<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success;
} 