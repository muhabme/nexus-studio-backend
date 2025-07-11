/**
 * Configuration interface for HttpException
 */
interface HttpExceptionOptions {
  statusCode?: number
  isExpected?: boolean
  path?: string
  method?: string
  errors?: string[] | Record<string, string[]>[]
}

/**
 * Custom Application Error Class
 * Extends the built-in Error class with additional properties for HTTP status codes,
 * operational error tracking, and error collections
 */
export class HttpException extends Error {
  public readonly statusCode: number
  public readonly isExpected: boolean
  public readonly timestamp: string
  public readonly path?: string
  public readonly method?: string
  public readonly errors?: string[] | Record<string, string[]>[]
  public override readonly stack?: string

  constructor(message: string, options: HttpExceptionOptions = {}) {
    super(message)

    // Set the prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, HttpException.prototype)

    this.statusCode = options.statusCode ?? 500
    this.isExpected = options.isExpected ?? true
    this.timestamp = new Date().toISOString()
    this.path = options.path
    this.method = options.method
    this.errors = options.errors

    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Create a Bad Request error (400)
   */
  static badRequest(
    message: string = "Bad Request",
    options: Omit<HttpExceptionOptions, "statusCode"> = {},
  ): HttpException {
    return new HttpException(message, { ...options, statusCode: 400 })
  }

  /**
   * Create an Unauthorized error (401)
   */
  static unauthorized(
    message: string = "Unauthorized",
    options: Omit<HttpExceptionOptions, "statusCode"> = {},
  ): HttpException {
    return new HttpException(message, { ...options, statusCode: 401 })
  }

  /**
   * Create a Forbidden error (403)
   */
  static forbidden(
    message: string = "Forbidden",
    options: Omit<HttpExceptionOptions, "statusCode"> = {},
  ): HttpException {
    return new HttpException(message, { ...options, statusCode: 403 })
  }

  /**
   * Create a Not Found error (404)
   */
  static notFound(
    message: string = "Not Found",
    options: Omit<HttpExceptionOptions, "statusCode"> = {},
  ): HttpException {
    return new HttpException(message, { ...options, statusCode: 404 })
  }

  /**
   * Create a Method Not Allowed error (405)
   */
  static methodNotAllowed(
    message: string = "Method Not Allowed",
    options: Omit<HttpExceptionOptions, "statusCode"> = {},
  ): HttpException {
    return new HttpException(message, { ...options, statusCode: 405 })
  }

  /**
   * Create a Conflict error (409)
   */
  static conflict(
    message: string = "Conflict",
    options: Omit<HttpExceptionOptions, "statusCode"> = {},
  ): HttpException {
    return new HttpException(message, { ...options, statusCode: 409 })
  }

  /**
   * Create an Unprocessable Entity error (422)
   */
  static unprocessableEntity(
    message: string = "Unprocessable Entity",
    options: Omit<HttpExceptionOptions, "statusCode"> = {},
  ): HttpException {
    return new HttpException(message, { ...options, statusCode: 422 })
  }

  /**
   * Create a Too Many Requests error (429)
   */
  static tooManyRequests(
    message: string = "Too Many Requests",
    options: Omit<HttpExceptionOptions, "statusCode"> = {},
  ): HttpException {
    return new HttpException(message, { ...options, statusCode: 429 })
  }

  /**
   * Create an Internal Server Error (500)
   */
  static internal(
    message: string = "Internal Server Error",
    options: Omit<HttpExceptionOptions, "statusCode"> = {},
  ): HttpException {
    return new HttpException(message, { ...options, statusCode: 500 })
  }

  /**
   * Create a Not Implemented error (501)
   */
  static notImplemented(
    message: string = "Not Implemented",
    options: Omit<HttpExceptionOptions, "statusCode"> = {},
  ): HttpException {
    return new HttpException(message, { ...options, statusCode: 501 })
  }

  /**
   * Create a Bad Gateway error (502)
   */
  static badGateway(
    message: string = "Bad Gateway",
    options: Omit<HttpExceptionOptions, "statusCode"> = {},
  ): HttpException {
    return new HttpException(message, { ...options, statusCode: 502 })
  }

  /**
   * Create a Service Unavailable error (503)
   */
  static serviceUnavailable(
    message: string = "Service Unavailable",
    options: Omit<HttpExceptionOptions, "statusCode"> = {},
  ): HttpException {
    return new HttpException(message, { ...options, statusCode: 503 })
  }

  /**
   * Create a Gateway Timeout error (504)
   */
  static gatewayTimeout(
    message: string = "Gateway Timeout",
    options: Omit<HttpExceptionOptions, "statusCode"> = {},
  ): HttpException {
    return new HttpException(message, { ...options, statusCode: 504 })
  }

  /**
   * Convert the error to a JSON object for API responses
   */
  toJSON(): {
    statusCode: number
    message: string
    timestamp: string
    path?: string
    method?: string
    errors?: string[] | Record<string, string[]>[]
    stack?: string
  } {
    return {
      statusCode: this.statusCode,
      message: this.message,
      timestamp: this.timestamp,
      ...(this.path && { path: this.path }),
      ...(this.method && { method: this.method }),
      ...(this.errors && { errors: this.errors }),
      ...(process.env.NODE_ENV === "development" && { stack: this.stack }),
    }
  }

  /**
   * Check if error is operational (expected) vs programming error
   */
  static isExpected(error: Error): boolean {
    if (error instanceof HttpException) {
      return error.isExpected
    }
    return false
  }
}

/**
 * Type guard to check if an error is an HttpException instance
 */
export const isHttpException = (error: any): error is HttpException => {
  return error instanceof HttpException
}

/**
 * Helper function to create HttpException from request context
 */
export const createAppError = (
  message: string,
  options: HttpExceptionOptions & { req?: { originalUrl?: string; method?: string } } = {},
): HttpException => {
  const { req, ...restOptions } = options
  return new HttpException(message, {
    ...restOptions,
    path: restOptions.path ?? req?.originalUrl,
    method: restOptions.method ?? req?.method,
  })
}

// Export default
export default HttpException
