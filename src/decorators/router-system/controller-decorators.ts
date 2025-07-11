import { RequestHandler } from "express"
import { getRouteMetadata } from "./metadata"

export function Controller(basePath = ""): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata("basePath", basePath, target)
  }
}

export function UseMiddleware(...middlewares: RequestHandler[]): MethodDecorator & ClassDecorator {
  return (target: any, propertyKey?: string | symbol) => {
    if (propertyKey) {
      const metadata = getRouteMetadata(target.constructor)
      let route = metadata.find((m) => m.handlerName === propertyKey)
      if (route) {
        route.middlewares = [...(route.middlewares || []), ...middlewares]
      } else {
        route = { handlerName: propertyKey as string, middlewares, method: "get", path: "" }
        metadata.push(route)
      }
    } else {
      Reflect.defineMetadata("middlewares", middlewares, target)
    }
  }
}
