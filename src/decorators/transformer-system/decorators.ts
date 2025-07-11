import { getOrCreatePropertyMetadata, getValidatorMetadata, setPropertyMetadata } from "./metadata"
import { ExcludeOptions, ExposeOptions, TransformFunctions } from "./types"

/**
 * Specifies the type of a property for transformation
 */
export function Type(typeFunction: () => any) {
  return function (target: any, propertyKey: string) {
    const existing = getOrCreatePropertyMetadata(target, propertyKey)
    existing.type = typeFunction
    setPropertyMetadata(target, propertyKey, existing)
  }
}

/**
 * Applies custom transformation functions to a property
 */
export function Transform(transformOptions: TransformFunctions) {
  return function (target: any, propertyKey: string) {
    const existing = getOrCreatePropertyMetadata(target, propertyKey)
    existing.transform = transformOptions
    setPropertyMetadata(target, propertyKey, existing)
  }
}

/**
 * Marks a property to be exposed during transformation
 */
export function Expose(options?: ExposeOptions) {
  return function (target: any, propertyKey: string) {
    const existing = getOrCreatePropertyMetadata(target, propertyKey)
    existing.expose = true
    if (options?.name) existing.name = options.name
    if (options?.groups) existing.groups = options.groups
    setPropertyMetadata(target, propertyKey, existing)
  }
}

/**
 * Marks a property to be excluded during transformation
 */
export function Exclude(options?: ExcludeOptions) {
  return function (target: any, propertyKey: string) {
    const existing = getOrCreatePropertyMetadata(target, propertyKey)
    existing.exclude = true
    if (options?.groups) existing.groups = options.groups
    setPropertyMetadata(target, propertyKey, existing)
  }
}

/**
 * Class decorator to exclude extraneous values by default
 */
export function ExcludeExtraneousValues() {
  return function (target: any) {
    const metadata = getValidatorMetadata(target.prototype)
    metadata.excludeExtraneousValues = true
  }
}
