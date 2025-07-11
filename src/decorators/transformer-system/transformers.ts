import { getValidatorMetadata } from "./metadata"
import {
  applyCustomTransformation,
  applyTypeTransformation,
  shouldExcludeExtraneous,
  shouldExcludeProperty,
} from "./transform-utils"
import { TransformOptions } from "./types"

export function plainToClass<T>(
  cls: new (...args: any[]) => T,
  plain: any,
  options: TransformOptions = {},
): T {
  if (Array.isArray(plain)) {
    return plain.map((item) => plainToClass(cls, item, options)) as any
  }

  const instance = new cls()
  const metadata = getValidatorMetadata(instance)

  // Set default values
  for (const [key, propMeta] of metadata.properties) {
    if ((plain[key] === undefined || plain[key] === null) && propMeta.defaultValue !== undefined) {
      ;(instance as any)[key] = propMeta.defaultValue
    }
  }

  // Handle exclude extraneous values
  const shouldExcludeExtraneousValues = shouldExcludeExtraneous(
    options,
    metadata.excludeExtraneousValues,
  )

  for (const [key, value] of Object.entries(plain)) {
    const propertyMetadata = metadata.properties.get(key)

    // Skip if property should be excluded
    if (shouldExcludeProperty(propertyMetadata, options)) {
      continue
    }

    // Skip if not exposed and excludeExtraneousValues is true
    if (
      shouldExcludeExtraneousValues &&
      !propertyMetadata?.expose &&
      !metadata.properties.has(key)
    ) {
      continue
    }

    let transformedValue = value

    // Apply custom transform
    if (propertyMetadata?.transform?.toClass) {
      transformedValue = applyCustomTransformation(value, propertyMetadata.transform, "toClass")
    }
    // Apply type transformation
    else if (propertyMetadata?.type) {
      transformedValue = applyTypeTransformation(value, propertyMetadata.type, options)
    }

    ;(instance as any)[key] = transformedValue
  }

  return instance
}

export function classToPlain<T>(obj: T, options: TransformOptions = {}): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => classToPlain(item, options))
  }

  if (obj === null || obj === undefined || typeof obj !== "object") {
    return obj
  }

  const metadata = getValidatorMetadata(obj)
  const result: any = {}

  for (const [key, value] of Object.entries(obj)) {
    const propertyMetadata = metadata.properties.get(key)

    // Skip if property should be excluded
    if (shouldExcludeProperty(propertyMetadata, options)) {
      continue
    }

    let transformedValue = value

    // Apply custom transform
    if (propertyMetadata?.transform?.toPlain) {
      transformedValue = applyCustomTransformation(value, propertyMetadata.transform, "toPlain")
    }
    // Default transformation for objects and arrays
    else if (value != null && typeof value === "object") {
      transformedValue = classToPlain(value, options)
    }

    const outputKey = propertyMetadata?.name || key
    result[outputKey] = transformedValue
  }

  return result
}
