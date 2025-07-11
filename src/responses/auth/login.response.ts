import { Expose, Type } from "@/decorators/transformer-system"
import { UserResponse } from "./user.response"

export class LoginResponse {
  @Expose()
  @Type(() => UserResponse)
  user: UserResponse

  @Expose()
  token: string
}
