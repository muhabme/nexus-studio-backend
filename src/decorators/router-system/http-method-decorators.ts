import { getRouteMetadata } from "./metadata"
import { RouteDefinition } from "./types"

function createMethodDecorator(method: RouteDefinition["method"]) {
  return function (path = ""): MethodDecorator {
    return (target, propertyKey) => {
      const metadata = getRouteMetadata(target.constructor as Function)
      let route = metadata.find((r) => r.handlerName === propertyKey)

      if (route) {
        route.method = method
        route.path = path
      } else {
        metadata.push({
          method,
          path,
          handlerName: propertyKey as string,
        })
      }
    }
  }
}

export const Get = createMethodDecorator("get")
export const Post = createMethodDecorator("post")
export const Put = createMethodDecorator("put")
export const Patch = createMethodDecorator("patch")
export const Delete = createMethodDecorator("delete")
