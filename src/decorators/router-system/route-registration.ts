import { Application, RequestHandler } from "express"
import { getAllRouteMetadata } from "./metadata"
import { RegisterRoutesOptions } from "./types"
import { createValidationMiddleware } from "./validation-middleware"

export function registerRoutes(
  app: Application,
  options: RegisterRoutesOptions,
  ControllerClass: any,
) {
  const controllerInstance = new ControllerClass()
  const metadata = getAllRouteMetadata().get(ControllerClass) || []
  const basePath: string = Reflect.getMetadata("basePath", ControllerClass) || ""
  const classMiddlewares: RequestHandler[] =
    Reflect.getMetadata("middlewares", ControllerClass) || []

  metadata.forEach((route) => {
    const fullPath = (options.basePath ?? "") + basePath + route.path
    const method = route.method

    const allMiddlewares: RequestHandler[] = [
      ...(options?.globalMiddlewares ?? []),
      ...classMiddlewares,
      ...(route.middlewares || []),
    ]

    if (route.paramsValidation) {
      allMiddlewares.push(
        createValidationMiddleware(
          "params",
          route.paramsValidation.type,
          route.paramsValidation.options,
        ),
      )
    }

    if (route.queryValidation) {
      allMiddlewares.push(
        createValidationMiddleware(
          "query",
          route.queryValidation.type,
          route.queryValidation.options,
        ),
      )
    }

    if (route.bodyValidation) {
      allMiddlewares.push(
        createValidationMiddleware("body", route.bodyValidation.type, route.bodyValidation.options),
      )
    }

    const handler = (controllerInstance as any)[route.handlerName].bind(controllerInstance)

    ;(app as any)[method](fullPath, ...allMiddlewares, handler)

    console.log(`Registered ${method.toUpperCase()} ${fullPath}`)
  })
}
