import { ErrorResponse } from "@/responses/common/error.response"
import { SuccessResponse } from "@/responses/common/success.response"
import { ControllerResponse } from "@/types/response"
import { ResponseTransformer } from "@/utils/helpers/response.transformer"
import { NextFunction, Request, Response } from "express"

export const responseHandler = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res)
  const originalSend = res.send.bind(res)

  res.json = function (body: any) {
    if (isAlreadyStandardized(body)) {
      return originalJson(body)
    }

    const standardizedResponse = standardizeResponse(body, res.statusCode, req)
    return originalJson(standardizedResponse)
  }

  res.send = function (body: any) {
    if (typeof body === "string" || Buffer.isBuffer(body)) {
      return originalSend(body)
    }

    if (isAlreadyStandardized(body)) {
      return originalSend(body)
    }

    const standardizedResponse = standardizeResponse(body, res.statusCode, req)
    return originalSend(standardizedResponse)
  }

  next()
}

function isAlreadyStandardized(body: any): boolean {
  return (
    body &&
    typeof body === "object" &&
    "status" in body &&
    ("data" in body || "error" in body) &&
    !("message" in body && "statusCode" in body && "requestId" in body)
  )
}

function standardizeResponse(body: any, statusCode: number, req: Request) {
  const isErrorStatus = statusCode >= 400

  if (!body || typeof body !== "object") {
    if (isErrorStatus) {
      const errorResponse = new ErrorResponse()
      errorResponse.message = body || "An error occurred"
      errorResponse.statusCode = statusCode
      errorResponse.requestId = req.requestId || generateRequestId()

      return ResponseTransformer.transform(ErrorResponse, errorResponse)
    } else {
      const successResponse = new SuccessResponse(body, statusCode)
      return ResponseTransformer.transform(SuccessResponse, successResponse)
    }
  }

  const controllerResponse = body as ControllerResponse<any>

  if (isErrorStatus) {
    return handleErrorResponse(controllerResponse, statusCode, req)
  } else {
    return handleSuccessResponse(controllerResponse, statusCode)
  }
}

function handleSuccessResponse(controllerResponse: ControllerResponse<any>, statusCode: number) {
  const data = extractDataFromControllerResponse(controllerResponse)
  const successResponse = new SuccessResponse(data, statusCode, controllerResponse.meta)
  return ResponseTransformer.transform(SuccessResponse, successResponse)
}

function handleErrorResponse(
  controllerResponse: ControllerResponse<any>,
  statusCode: number,
  req: Request,
) {
  // Check if this is a raw error object from globalErrorHandler
  if (isRawErrorObject(controllerResponse)) {
    return handleRawErrorObject(controllerResponse, req)
  }

  // Handle regular controller error responses
  const errorMessage = controllerResponse.message || "An error occurred"
  const errors = extractErrorsFromControllerResponse(controllerResponse)

  const errorResponse = new ErrorResponse()
  errorResponse.message = errorMessage
  errorResponse.statusCode = statusCode
  errorResponse.requestId = req.requestId || generateRequestId()
  errorResponse.errors = errors

  // Development-only properties (you might want to check NODE_ENV)
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = controllerResponse.stack
    errorResponse.isExpected = controllerResponse.isExpected
  }

  return ResponseTransformer.transform(ErrorResponse, errorResponse)
}

function extractDataFromControllerResponse(response: ControllerResponse<any>): any {
  // If there's a 'data' property, use it
  if ("data" in response) {
    return response.data
  }

  // Create a new object excluding known metadata properties
  const {
    message: _message,
    meta: _meta,
    errors: _errors,
    stack: _stack,
    isExpected: _isExpected,
    ...data
  } = response

  // If only one property remains, return its value
  const dataKeys = Object.keys(data)
  if (dataKeys.length === 1 && dataKeys[0]) {
    return data[dataKeys[0]]
  }

  // If multiple properties or no data properties, return the data object
  return dataKeys.length > 0 ? data : null
}

function extractErrorsFromControllerResponse(
  response: ControllerResponse<any>,
): string[] | Record<string, string[]>[] | undefined {
  // Check for common error properties
  if ("errors" in response) {
    return response.errors
  }

  if ("validation" in response) {
    return response.validation
  }

  if ("details" in response && Array.isArray(response.details)) {
    return response.details
  }

  // If there's a data property with errors
  if ("data" in response && response.data) {
    if ("errors" in response.data) {
      return response.data.errors
    }
    if ("validation" in response.data) {
      return response.data.validation
    }
  }

  return undefined
}

function generateRequestId(): string {
  // Simple request ID generator - you might want to use a more sophisticated approach
  // or get it from request headers/context
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function isRawErrorObject(obj: any): boolean {
  // Check if this looks like the raw error object from globalErrorHandler
  return (
    obj &&
    typeof obj === "object" &&
    "message" in obj &&
    "statusCode" in obj &&
    "requestId" in obj &&
    "success" in obj &&
    obj.success === false
  )
}

function handleRawErrorObject(errorObj: any, req: Request) {
  // This handles the raw error object from globalErrorHandler
  const errorResponse = new ErrorResponse()
  errorResponse.message = errorObj.message
  errorResponse.statusCode = errorObj.statusCode
  errorResponse.requestId = errorObj.requestId || req.requestId || generateRequestId()
  errorResponse.errors = errorObj.errors

  // Development-only properties
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = errorObj.stack
    errorResponse.isExpected = errorObj.isExpected
  }

  return ResponseTransformer.transform(ErrorResponse, errorResponse)
}
