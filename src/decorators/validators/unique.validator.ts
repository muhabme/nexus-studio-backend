import { Model } from "objection"
import { getOrCreatePropertyMetadata, setPropertyMetadata } from "../transformer-system/metadata"

export function Unique(
  modelClass: typeof Model,
  column?: string,
  message = "Value must be unique",
) {
  return function (target: any, propertyKey: string) {
    const existing = getOrCreatePropertyMetadata(target, propertyKey)
    existing.validators = existing.validators || []

    existing.validators.push(async (value: any) => {
      if (value === undefined || value === null) return null
      const col = column || propertyKey
      const found = await modelClass.query().findOne({ [col]: value })
      return found ? message : null
    })

    setPropertyMetadata(target, propertyKey, existing)
  }
}
