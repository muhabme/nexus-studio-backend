import { ClassMetadata, PropertyMetadata } from "./types"

const METADATA_KEY = Symbol("class-transformer-metadata")

/**
 * Gets or creates metadata for a class
 */
export function getValidatorMetadata(target: any): ClassMetadata {
  if (!target.constructor[METADATA_KEY]) {
    target.constructor[METADATA_KEY] = {
      properties: new Map<string, PropertyMetadata>(),
    }
  }
  return target.constructor[METADATA_KEY]
}

/**
 * Gets existing property metadata or creates new one
 */
export function getOrCreatePropertyMetadata(target: any, propertyKey: string): PropertyMetadata {
  const metadata = getValidatorMetadata(target)
  const existing = metadata.properties.get(propertyKey) || { propertyKey }
  return existing
}

/**
 * Sets property metadata
 */
export function setPropertyMetadata(
  target: any,
  propertyKey: string,
  propertyMetadata: PropertyMetadata,
): void {
  const metadata = getValidatorMetadata(target)
  metadata.properties.set(propertyKey, propertyMetadata)
}

export function createValidator(validatorFn: (value: any) => any) {
  return function (target: any, propertyKey: string) {
    const existing = getOrCreatePropertyMetadata(target, propertyKey)
    existing.validators = existing.validators || []

    existing.validators.push(validatorFn)

    setPropertyMetadata(target, propertyKey, existing)
  }
}
