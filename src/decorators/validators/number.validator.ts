import { createValidator } from "../transformer-system/metadata"

export function IsNumber(message = "Value must be a number") {
  return createValidator((value: any) => {
    return typeof value === "number" ? null : message
  })
}
