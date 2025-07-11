import { getRouteMetadata } from "./metadata"
import { ValidationOptions } from "./types"

/**
 * Validates request body against a class schema
 */
export function ValidateBody<T>(
  type: new (...args: any[]) => T,
  options?: ValidationOptions,
): MethodDecorator {
  return (target, propertyKey) => {
    const metadata = getRouteMetadata(target.constructor as Function)
    let route = metadata.find((r) => r.handlerName === propertyKey)

    if (!route) {
      route = {
        method: "post",
        path: "",
        handlerName: propertyKey as string,
      }
      metadata.push(route)
    }

    route.bodyValidation = { type, options }
  }
}

/**
 * Validates query parameters against a class schema
 */
export function ValidateQuery<T>(
  type: new (...args: any[]) => T,
  options?: ValidationOptions,
): MethodDecorator {
  return (target, propertyKey) => {
    const metadata = getRouteMetadata(target.constructor as Function)
    let route = metadata.find((r) => r.handlerName === propertyKey)

    if (!route) {
      route = {
        method: "get",
        path: "",
        handlerName: propertyKey as string,
      }
      metadata.push(route)
    }

    route.queryValidation = { type, options }
  }
}

/**
 * Validates route parameters against a class schema
 */
export function ValidateParams<T>(
  type: new (...args: any[]) => T,
  options?: ValidationOptions,
): MethodDecorator {
  return (target, propertyKey) => {
    const metadata = getRouteMetadata(target.constructor as Function)
    let route = metadata.find((r) => r.handlerName === propertyKey)

    if (!route) {
      route = {
        method: "get",
        path: "",
        handlerName: propertyKey as string,
      }
      metadata.push(route)
    }

    route.paramsValidation = { type, options }
  }
}
