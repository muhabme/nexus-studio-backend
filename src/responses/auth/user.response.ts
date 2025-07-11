import { Expose, Transform } from "@/decorators/transformer-system"

export class UserResponse {
  @Expose()
  id: string

  @Expose()
  email: string

  @Expose()
  firstName: string

  @Expose()
  lastName: string

  @Expose()
  @Transform({
    toClass: ({ value }) => value?.toISOString(),
    toPlain: ({ value }) => value?.toISOString(),
  })
  createdAt: string

  @Expose()
  @Transform({
    toClass: ({ value }) => value?.toISOString(),
    toPlain: ({ value }) => value?.toISOString(),
  })
  updatedAt: string
}
