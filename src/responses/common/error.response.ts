import { ExcludeExtraneousValues, Expose } from "@/decorators/transformer-system"

@ExcludeExtraneousValues()
export class ErrorResponse {
  @Expose({ name: "message" })
  message: string

  @Expose({ name: "statusCode" })
  statusCode: number

  @Expose({ name: "requestId" })
  requestId: string

  @Expose({ name: "errors" })
  errors?: string[] | Record<string, string[]>[]

  // Development Only
  @Expose({ name: "stack" })
  stack?: string

  // Development Only
  @Expose({ name: "isExpected" })
  isExpected?: boolean
}
