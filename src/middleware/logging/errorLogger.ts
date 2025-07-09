import AppError, { isAppError } from "@/utils/errors/AppError"
import logger from "@/utils/logger/winston"
import { NextFunction, Request, Response } from "express"
import { Server } from "http"

export const errorLogger = (err: Error, req: Request, _res: Response, next: NextFunction) => {
  const errorInfo = {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    userId: req.user?.id,
    requestId: req.requestId,
    executionId: req.headers["x-execution-id"] as string,
    workflowId: req.headers["x-workflow-id"] as string,
    body: req.body,
    params: req.params,
    query: req.query,
    headers: req.headers,
    timestamp: new Date().toISOString(),
  }

  if (isAppError(err)) {
    if (err.statusCode >= 500) {
      logger.error("Server Error", {
        ...errorInfo,
        statusCode: err.statusCode,
        status: err.status,
        isOperational: err.isOperational,
      })
    } else if (err.statusCode >= 400) {
      logger.warn("Client Error", {
        ...errorInfo,
        statusCode: err.statusCode,
        status: err.status,
        isOperational: err.isOperational,
      })
    }
  } else {
    logger.error("Unexpected Error", {
      ...errorInfo,
      errorName: err.name,
      errorConstructor: err.constructor.name,
    })
  }

  next(err)
}

export const asyncErrorHandler = <T extends any[]>(
  fn: (req: Request, res: Response, next: NextFunction, ...args: T) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction, ...args: T) => {
    Promise.resolve(fn(req, res, next, ...args)).catch(next)
  }
}

const convertToAppError = (err: Error, req: Request): AppError => {
  if (isAppError(err)) {
    return err
  }

  switch (err.name) {
    case "ValidationError":
      return new AppError("Validation failed", 400, true, req.originalUrl, req.method)

    case "CastError":
      return new AppError("Invalid ID format", 400, true, req.originalUrl, req.method)

    case "MongoError":
    case "SequelizeError":
      if ("code" in err && (err as any).code === 11000) {
        return new AppError("Duplicate entry", 409, true, req.originalUrl, req.method)
      }
      break

    case "JsonWebTokenError":
      return AppError.unauthorized("Invalid token")

    case "TokenExpiredError":
      return AppError.unauthorized("Token expired")

    case "SyntaxError":
      if (err.message.includes("JSON")) {
        return AppError.badRequest("Invalid JSON payload")
      }
      break
  }

  if ("code" in err) {
    const systemError = err as NodeJS.ErrnoException
    switch (systemError.code) {
      case "ENOENT":
        return AppError.notFound("Resource not found")
      case "EACCES":
        return AppError.forbidden("Access denied")
      case "EMFILE":
      case "ENFILE":
        return AppError.serviceUnavailable("Too many open files")
      case "ECONNREFUSED":
        return AppError.serviceUnavailable("Connection refused")
      case "ETIMEDOUT":
        return AppError.gatewayTimeout("Request timeout")
    }
  }

  // Default to internal server error for unknown errors
  return AppError.internal(
    process.env.NODE_ENV === "development" ? err.message : "Internal Server Error",
    req.originalUrl,
    req.method,
  )
}

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const appError = convertToAppError(err, req)

  errorLogger(appError, req, res, () => {})

  res.status(appError.statusCode).json({
    success: false,
    error: {
      message: appError.message,
      status: appError.status,
      statusCode: appError.statusCode,
      timestamp: appError.timestamp,
      path: appError.path,
      method: appError.method,
      requestId: req.requestId,
      ...(process.env.NODE_ENV === "development" && {
        stack: appError.stack,
        isOperational: appError.isOperational,
      }),
    },
  })
}

export const endpointNotFoundMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404) as any

  next(error)
}

export const unhandledRejectionHandler = (reason: any, promise: Promise<any>) => {
  const error = reason instanceof Error ? reason : new Error(String(reason))

  logger.error("Unhandled Promise Rejection", {
    message: error.message,
    stack: error.stack,
    reason: reason?.toString(),
    promise: promise.toString(),
    timestamp: new Date().toISOString(),
  })

  // In production, you might want to gracefully shut down
  if (process.env.NODE_ENV === "production") {
    logger.error("Shutting down due to unhandled promise rejection")
    process.exit(1)
  }
}

export const uncaughtExceptionHandler = (error: Error) => {
  logger.error("Uncaught Exception", {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
  })

  logger.error("Shutting down due to uncaught exception")
  process.exit(1)
}

export const errorBoundary = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void> | void,
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      // Convert to AppError and pass to error handler
      const appError = convertToAppError(error as Error, req)
      next(appError)
    }
  }
}

export const gracefulShutdown = (server: Server) => {
  return (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully`)

    server.close(() => {
      logger.info("Process terminated gracefully")
      process.exit(0)
    })

    setTimeout(() => {
      logger.error("Forced shutdown after timeout")
      process.exit(1)
    }, 10000)
  }
}
