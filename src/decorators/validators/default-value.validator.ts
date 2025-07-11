import { getOrCreatePropertyMetadata, setPropertyMetadata } from "../transformer-system/metadata"

export function DefaultValue(defaultValue: any) {
  return function (target: any, propertyKey: string) {
    const existing = getOrCreatePropertyMetadata(target, propertyKey)

    existing.defaultValue = defaultValue

    setPropertyMetadata(target, propertyKey, existing)
  }
}
