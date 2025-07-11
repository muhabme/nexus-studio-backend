import { PropertyMetadata, TransformOptions } from "./types"

/**
 * Checks if a property should be excluded based on groups
 */
export function shouldExcludeProperty(
  propertyMetadata: PropertyMetadata | undefined,
  options: TransformOptions,
): boolean {
  if (!propertyMetadata) return false

  // Skip if property is excluded
  if (
    propertyMetadata.exclude &&
    (!propertyMetadata.groups || !options.groups?.some((g) => propertyMetadata.groups?.includes(g)))
  ) {
    return true
  }

  // Apply group filtering
  if (
    options.groups &&
    propertyMetadata.groups &&
    !options.groups.some((g) => propertyMetadata.groups?.includes(g))
  ) {
    return true
  }

  return false
}

/**
 * Checks if extraneous values should be excluded
 */
export function shouldExcludeExtraneous(
  options: TransformOptions,
  classExcludeExtraneous?: boolean,
): boolean {
  return options.excludeExtraneousValues ?? classExcludeExtraneous ?? false
}

/**
 * Applies type transformation to a value
 */
export function applyTypeTransformation(
  value: any,
  typeFunction: () => any,
  options: TransformOptions,
): any {
  if (value == null) return value

  const TypeClass = typeFunction()
  if (typeof TypeClass !== "function") return value

  if (Array.isArray(value)) {
    return value.map((item) =>
      typeof item === "object" ? transformToClass(TypeClass, item, options) : item,
    )
  } else if (typeof value === "object") {
    return transformToClass(TypeClass, value, options)
  }

  return value
}

/**
 * Internal function to avoid circular dependency
 */
function transformToClass<T>(
  cls: new (...args: any[]) => T,
  plain: any,
  options: TransformOptions,
): T {
  // This will be imported from the main transform function
  // to avoid circular dependencies
  const { plainToClass } = require("./transformers")
  return plainToClass(cls, plain, options)
}

/**
 * Applies custom transformation to a value
 */
export function applyCustomTransformation(
  value: any,
  transform: { toPlain?: (value: any) => any; toClass?: (value: any) => any },
  direction: "toPlain" | "toClass",
): any {
  const transformFn = transform[direction]
  return transformFn ? transformFn(value) : value
}
