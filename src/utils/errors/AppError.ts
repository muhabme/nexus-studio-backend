/**
 * Custom Application Error Class
 * Extends the built-in Error class with additional properties for HTTP status codes
 * and operational error tracking
 */
export class AppError extends Error {
  public readonly statusCode: number
  public readonly status: string
  public readonly isOperational: boolean
  public readonly timestamp: string
  public readonly path?: string
  public readonly method?: string
  public override readonly stack?: string

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    path?: string,
    method?: string,
  ) {
    super(message)

    // Set the prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, AppError.prototype)

    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error"
    this.isOperational = isOperational
    this.timestamp = new Date().toISOString()
    this.path = path
    this.method = method

    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Create a Bad Request error (400)
   */
  static badRequest(message: string = "Bad Request", path?: string, method?: string): AppError {
    return new AppError(message, 400, true, path, method)
  }

  /**
   * Create an Unauthorized error (401)
   */
  static unauthorized(message: string = "Unauthorized", path?: string, method?: string): AppError {
    return new AppError(message, 401, true, path, method)
  }

  /**
   * Create a Forbidden error (403)
   */
  static forbidden(message: string = "Forbidden", path?: string, method?: string): AppError {
    return new AppError(message, 403, true, path, method)
  }

  /**
   * Create a Not Found error (404)
   */
  static notFound(message: string = "Not Found", path?: string, method?: string): AppError {
    return new AppError(message, 404, true, path, method)
  }

  /**
   * Create a Method Not Allowed error (405)
   */
  static methodNotAllowed(
    message: string = "Method Not Allowed",
    path?: string,
    method?: string,
  ): AppError {
    return new AppError(message, 405, true, path, method)
  }

  /**
   * Create a Conflict error (409)
   */
  static conflict(message: string = "Conflict", path?: string, method?: string): AppError {
    return new AppError(message, 409, true, path, method)
  }

  /**
   * Create an Unprocessable Entity error (422)
   */
  static unprocessableEntity(
    message: string = "Unprocessable Entity",
    path?: string,
    method?: string,
  ): AppError {
    return new AppError(message, 422, true, path, method)
  }

  /**
   * Create a Too Many Requests error (429)
   */
  static tooManyRequests(
    message: string = "Too Many Requests",
    path?: string,
    method?: string,
  ): AppError {
    return new AppError(message, 429, true, path, method)
  }

  /**
   * Create an Internal Server Error (500)
   */
  static internal(
    message: string = "Internal Server Error",
    path?: string,
    method?: string,
  ): AppError {
    return new AppError(message, 500, true, path, method)
  }

  /**
   * Create a Not Implemented error (501)
   */
  static notImplemented(
    message: string = "Not Implemented",
    path?: string,
    method?: string,
  ): AppError {
    return new AppError(message, 501, true, path, method)
  }

  /**
   * Create a Bad Gateway error (502)
   */
  static badGateway(message: string = "Bad Gateway", path?: string, method?: string): AppError {
    return new AppError(message, 502, true, path, method)
  }

  /**
   * Create a Service Unavailable error (503)
   */
  static serviceUnavailable(
    message: string = "Service Unavailable",
    path?: string,
    method?: string,
  ): AppError {
    return new AppError(message, 503, true, path, method)
  }

  /**
   * Create a Gateway Timeout error (504)
   */
  static gatewayTimeout(
    message: string = "Gateway Timeout",
    path?: string,
    method?: string,
  ): AppError {
    return new AppError(message, 504, true, path, method)
  }

  /**
   * Convert the error to a JSON object for API responses
   */
  toJSON(): {
    status: string
    statusCode: number
    message: string
    timestamp: string
    path?: string
    method?: string
    stack?: string
  } {
    return {
      status: this.status,
      statusCode: this.statusCode,
      message: this.message,
      timestamp: this.timestamp,
      ...(this.path && { path: this.path }),
      ...(this.method && { method: this.method }),
      ...(process.env.NODE_ENV === "development" && { stack: this.stack }),
    }
  }

  /**
   * Check if error is operational (expected) vs programming error
   */
  static isOperational(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational
    }
    return false
  }
}

/**
 * Type guard to check if an error is an AppError instance
 */
export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError
}

/**
 * Helper function to create AppError from request context
 */
export const createAppError = (
  message: string,
  statusCode: number,
  req?: { originalUrl?: string; method?: string },
): AppError => {
  return new AppError(message, statusCode, true, req?.originalUrl, req?.method)
}

// Export default
export default AppError
