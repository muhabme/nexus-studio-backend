import { ExcludeExtraneousValues, Expose } from "@/decorators/transformer-system"
import { IsEmail } from "@/decorators/validators/email.validator"
import { Required } from "@/decorators/validators/required.validator"
import { IsString } from "@/decorators/validators/string.validator"

@ExcludeExtraneousValues()
class LoginUserDto {
  @Expose()
  @Required()
  @IsEmail()
  email: string

  @Expose()
  @Required()
  @IsString()
  password: string
}

export { LoginUserDto }
