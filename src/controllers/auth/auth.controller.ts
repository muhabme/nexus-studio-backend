import { Controller, Post, ValidateBody } from "@/decorators/router-system"
import { LoginUserDto } from "@/requests/auth/login.request"
import { RegisterUserDto } from "@/requests/auth/register.request"
import AuthService from "@/services/auth/auth.service"
import { Request, Response } from "express"

@Controller("/auth")
class AuthController {
  @Post("/register")
  @ValidateBody(RegisterUserDto)
  async register({ body }: Request, res: Response) {
    console.log(body)
    const user = await AuthService.register(body)

    return res.status(201).json({
      success: true,
      user,
    })
  }

  @Post("/login")
  @ValidateBody(LoginUserDto)
  async login(req: Request, res: Response) {
    const { user, token } = await AuthService.login(req.body)

    return res.json({ user, token })
  }
}

export { AuthController }
