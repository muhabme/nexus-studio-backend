import { getValidatorMetadata } from "../transformer-system"

export function Required(message?: string) {
  return function (target: any, propertyKey: string) {
    const msg = message || `${propertyKey} is required`

    const metadata = getValidatorMetadata(target)
    const existing = metadata.properties.get(propertyKey) || { propertyKey }
    existing.validators = existing.validators || []

    existing.validators.push((value: any) => {
      return value === undefined || value === null ? msg : null
    })

    metadata.properties.set(propertyKey, existing)
  }
}
