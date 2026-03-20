export type ErrorCode =
  | "CONFIG_ERROR"
  | "VALIDATION_ERROR"
  | "NETWORK_ERROR"
  | "API_ERROR"
  | "FILE_SYSTEM_ERROR";

export class IcoraError extends Error {
  constructor(
    message: string,
    readonly code: ErrorCode,
    readonly exitCode = 1,
    readonly suggestion?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = this.constructor.name;
  }
}

export class ConfigError extends IcoraError {
  constructor(message: string, suggestion?: string, options?: ErrorOptions) {
    super(message, "CONFIG_ERROR", 1, suggestion, options);
  }
}

export class ValidationError extends IcoraError {
  constructor(message: string, suggestion?: string, options?: ErrorOptions) {
    super(message, "VALIDATION_ERROR", 1, suggestion, options);
  }
}

export class NetworkError extends IcoraError {
  constructor(message: string, suggestion?: string, options?: ErrorOptions) {
    super(message, "NETWORK_ERROR", 1, suggestion, options);
  }
}

export class ApiError extends IcoraError {
  constructor(message: string, suggestion?: string, options?: ErrorOptions) {
    super(message, "API_ERROR", 1, suggestion, options);
  }
}

export class FileSystemError extends IcoraError {
  constructor(message: string, suggestion?: string, options?: ErrorOptions) {
    super(message, "FILE_SYSTEM_ERROR", 1, suggestion, options);
  }
}

export function toIcoraError(error: unknown): IcoraError {
  if (error instanceof IcoraError) {
    return error;
  }

  if (error instanceof Error) {
    return new IcoraError(error.message, "API_ERROR", 1, undefined, { cause: error });
  }

  return new IcoraError("An unknown error occurred.", "API_ERROR");
}
