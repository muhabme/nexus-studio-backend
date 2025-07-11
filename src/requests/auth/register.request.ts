import { ExcludeExtraneousValues, Expose } from "@/decorators/transformer-system"
import { IsEmail } from "@/decorators/validators/email.validator"
import { Required } from "@/decorators/validators/required.validator"
import { IsString } from "@/decorators/validators/string.validator"
import { Unique } from "@/decorators/validators/unique.validator"
import { User } from "@/models/User"

@ExcludeExtraneousValues()
class RegisterRequest {
  @Expose()
  @IsString()
  @Required()
  name: string

  @Expose()
  @Required()
  @IsString()
  @IsEmail()
  @Unique(User)
  email: string

  @Expose()
  @IsString()
  @Required()
  password: string
}

export { RegisterRequest }
