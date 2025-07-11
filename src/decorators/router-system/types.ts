import { RequestHandler } from "express"

export interface RouteDefinition {
  method: "get" | "post" | "put" | "patch" | "delete"
  path: string
  handlerName: string
  middlewares?: RequestHandler[]
  bodyValidation?: {
    type: new (...args: any[]) => any
    options?: ValidationOptions
  }
  queryValidation?: {
    type: new (...args: any[]) => any
    options?: ValidationOptions
  }
  paramsValidation?: {
    type: new (...args: any[]) => any
    options?: ValidationOptions
  }
}

export interface ValidationOptions {
  groups?: string[]
  skipMissingProperties?: boolean
  forbidNonWhitelisted?: boolean
}

export interface RegisterRoutesOptions {
  basePath?: string
  globalMiddlewares?: RequestHandler[]
}
