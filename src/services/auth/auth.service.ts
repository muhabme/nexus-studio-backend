import { User } from "@/models/User"
import UserRepository from "@/repositories/UserRepository"
import { LoginUserDto } from "@/requests/auth/login.request"
import { RegisterUserDto } from "@/requests/auth/register.request"
import JwtService, { JwtPayload } from "@/services/auth/jwt.service"
import HttpException from "@/utils/errors/HttpException"
import PasswordService from "./password.service"

class AuthService {
  async register(body: RegisterUserDto) {
    const user = await UserRepository.create({
      email: body.email,
      name: body.name,
      password_hash: await PasswordService.hash(body.password),
    })

    return user
  }

  async login(body: LoginUserDto) {
    const { email, password } = body
    if (!email || !password) {
      throw HttpException.badRequest("Email and password are required.")
    }

    const user = await UserRepository.findOneBy({ email })
    if (!user) {
      throw HttpException.unauthorized("Invalid email or password.")
    }

    await this.verifyPassword(password, user.password_hash)

    const { token } = this.generateJwtToken(user)

    void UserRepository.updateLastLogin(user.id)

    return { token, user }
  }

  private async verifyPassword(plainPassword: string, hash: string) {
    const passwordMatches = await PasswordService.verify(plainPassword, hash)

    if (!passwordMatches) {
      throw HttpException.unauthorized("Invalid email or password.")
    }
  }

  private generateJwtToken(user: User) {
    const payload: JwtPayload = { id: user.id, role: user.role }
    const token = JwtService.sign(payload)

    return { token }
  }
}

export default new AuthService()
