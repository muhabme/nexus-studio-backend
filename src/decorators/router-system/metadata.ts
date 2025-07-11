import { RouteDefinition } from "./types"

const routeMetadata = new Map<Function, RouteDefinition[]>()

export function getRouteMetadata(target: Function): RouteDefinition[] {
  if (!routeMetadata.has(target)) {
    routeMetadata.set(target, [])
  }
  return routeMetadata.get(target)!
}

export function getAllRouteMetadata(): Map<Function, RouteDefinition[]> {
  return routeMetadata
}
