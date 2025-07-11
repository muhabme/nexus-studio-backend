import { createValidator } from "../transformer-system/metadata"

export function IsString(message = "Value must be a string") {
  return createValidator((value: any) => {
    return typeof value === "string" ? null : message
  })
}
