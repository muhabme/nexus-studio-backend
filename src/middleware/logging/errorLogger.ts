import { ApiResponseHandler } from "@/responses"
import { ErrorResponse } from "@/responses/common/error.response"
import HttpException, { isHttpException } from "@/utils/errors/HttpException"
import logger from "@/utils/logger/winston"
import { NextFunction, Request, Response } from "express"
import { Server } from "http"

export const logError = (err: Error, req: Request, _res: Response) => {
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

  if (isHttpException(err)) {
    if (err.statusCode >= 500) {
      logger.error("Server Error", {
        ...errorInfo,
        statusCode: err.statusCode,
        isExpected: err.isExpected,
      })
    } else if (err.statusCode >= 400) {
      logger.warn("Client Error: ", {
        ...errorInfo,
        statusCode: err.statusCode,
        isExpected: err.isExpected,
      })
    }
  } else {
    logger.error("Unexpected Error", {
      ...errorInfo,
      errorName: err.name,
      errorConstructor: err.constructor.name,
    })
  }
}

export const asyncErrorHandler = <T extends any[]>(
  fn: (req: Request, res: Response, next: NextFunction, ...args: T) => Promise<any>,
) => {
  return (req: Request, res: Response, next: NextFunction, ...args: T) => {
    Promise.resolve(fn(req, res, next, ...args)).catch(next)
  }
}

const convertToHttpException = (err: Error, req: Request): HttpException => {
  // Return as-is if already HttpException
  if (isHttpException(err)) {
    return err as HttpException
  }

  // Base options for HTTP context
  const options = {
    path: req.originalUrl,
    method: req.method,
    isExpected: true,
  }

  switch (err.name) {
    case "ValidationError":
      return HttpException.badRequest("Validation failed", options)

    case "CastError":
      return HttpException.badRequest("Invalid ID format", options)

    case "MongoError":
    case "SequelizeError": {
      const anyErr = err as any
      if (anyErr.code === 11000) {
        return HttpException.conflict("Duplicate entry", options)
      }
      break
    }

    case "JsonWebTokenError":
      return HttpException.unauthorized("Invalid token", options)

    case "TokenExpiredError":
      return HttpException.unauthorized("Token expired", options)

    case "SyntaxError":
      if (err.message.includes("JSON")) {
        return HttpException.badRequest("Invalid JSON payload", options)
      }
      break
  }

  // Node system errors
  const sysErr = err as NodeJS.ErrnoException
  if (sysErr.code) {
    switch (sysErr.code) {
      case "ENOENT":
        return HttpException.notFound("Resource not found", options)
      case "EACCES":
        return HttpException.forbidden("Access denied", options)
      case "EMFILE":
      case "ENFILE":
        return HttpException.serviceUnavailable("Too many open files", options)
      case "ECONNREFUSED":
        return HttpException.serviceUnavailable("Connection refused", options)
      case "ETIMEDOUT":
        return HttpException.gatewayTimeout("Request timeout", options)
    }
  }

  // Fallback to internal server error
  return HttpException.internal(
    process.env.NODE_ENV === "development" ? err.message : "Internal Server Error",
    options,
  )
}

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const appError = convertToHttpException(err, req)

  logError(appError, req, res)

  const jsonResponse = {
    success: false,

    message: appError.message,
    statusCode: appError.statusCode,
    timestamp: appError.timestamp,
    path: appError.path,
    method: appError.method,
    requestId: req.requestId,

    errors: appError.errors,

    ...(process.env.NODE_ENV === "development" && {
      stack: appError.stack,
      isExpected: appError.isExpected,
    }),
  }

  const standardizedResponse = ApiResponseHandler.standardize(ErrorResponse, jsonResponse)

  res.status(appError.statusCode).json(standardizedResponse)
}

export const endpointNotFoundMiddleware = (req: Request, _res: Response) => {
  throw HttpException.notFound(`Route ${req.originalUrl} not found`)
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
      // Convert to HttpException and pass to error handler
      const appError = convertToHttpException(error as Error, req)
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
