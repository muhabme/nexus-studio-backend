import HttpException from "@/utils/errors/HttpException"
import { NextFunction, Request, RequestHandler, Response } from "express"
import { classToPlain, plainToClass, validate } from "../transformer-system"
import { ValidationOptions } from "./types"

export function createValidationMiddleware(
  validationType: "body" | "query" | "params",
  type: new (...args: any[]) => any,
  options: ValidationOptions = {},
): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[validationType]

      const instance = plainToClass(type, dataToValidate, {
        groups: options.groups,
        excludeExtraneousValues: options.forbidNonWhitelisted,
      })

      const errors = await validate(instance)

      if (errors && errors.length > 0) {
        throw HttpException.badRequest("Validation failed", {
          errors: errors,
        })
      }

      switch (validationType) {
        case "body":
          req.body = classToPlain(instance)
          break
        case "query":
          req.query = classToPlain(instance) as any
          break
        case "params":
          req.params = classToPlain(instance) as any
          break
      }

      next()
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }

      throw HttpException.internal("Validation failed")
    }
  }
}
