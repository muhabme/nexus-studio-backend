import { createValidator } from "../transformer-system/metadata"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function IsEmail(message = "Value must be a valid email") {
  return createValidator((value: any) => {
    return emailRegex.test(value) ? null : message
  })
}
