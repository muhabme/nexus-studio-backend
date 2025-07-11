import { getValidatorMetadata } from "./metadata"

/**
 * Validates an object against its metadata validators
 */
export async function validate(obj: any): Promise<Record<string, string[]>[]> {
  const metadata = getValidatorMetadata(obj)
  const errorsArray: Record<string, string[]>[] = []

  for (const [key, propertyMetadata] of metadata.properties) {
    const value = (obj as any)[key]

    if (propertyMetadata.validators) {
      const propertyErrors: string[] = []

      for (const validator of propertyMetadata.validators) {
        const error = await validator(value)
        if (error) {
          propertyErrors.push(error)
        }
      }

      if (propertyErrors.length > 0) {
        errorsArray.push({ [key]: propertyErrors })
      }
    }
  }

  return errorsArray
}
