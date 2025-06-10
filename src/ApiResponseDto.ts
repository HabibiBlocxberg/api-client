/**
 * DTO-Implementierung für API-Responses
 * 
 * WICHTIG: Nur Methoden-basierte API verfügbar:
 * - isSuccess() für Erfolgs-Check
 * - getData() für Daten-Zugriff  
 * - getError() für Fehler-Zugriff
 * 
 * Direkte Properties (.success, .data, .error) sind NICHT verfügbar!
 */
export class ApiResponseDto<T = unknown> {
  private readonly _success: boolean;
  private readonly _data?: T;
  private readonly _message?: string;

  constructor(success: boolean, data?: T, message?: string) {
    this._success = success;
    this._data = data;
    this._message = message;
  }

  /**
   * Prüft, ob die Anfrage erfolgreich war
   */
  public isSuccess(): boolean {
    return this._success;
  }

  /**
   * Prüft, ob ein Fehler aufgetreten ist
   */
  public isError(): boolean {
    return !this._success;
  }

  /**
   * Gibt die Daten zurück, falls verfügbar
   */
  public getData(): T | undefined {
    return this._data;
  }

  /**
   * Gibt die Nachricht zurück, falls vorhanden
   */
  public getMessage(): string | undefined {
    return this._message;
  }

  /**
   * Gibt den Fehler zurück, falls vorhanden (Alias für getMessage)
   */
  public getError(): string | undefined {
    return this._message;
  }

  /**
   * Erstellt eine erfolgreiche Response
   */
  public static success<T>(data: T): ApiResponseDto<T> {
    return new ApiResponseDto(true, data);
  }

  /**
   * Erstellt eine fehlerhafte Response
   */
  public static error<T = unknown>(message: string): ApiResponseDto<T> {
    return new ApiResponseDto<T>(false, undefined, message);
  }
} 