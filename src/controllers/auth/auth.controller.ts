import { Controller, Post, ValidateBody } from "@/decorators/router-system"
import { LoginRequest } from "@/requests/auth/login.request"
import { RegisterRequest } from "@/requests/auth/register.request"
import { LoginResponse } from "@/responses/auth/login.response"
import { UserResponse } from "@/responses/auth/user.response"
import AuthService from "@/services/auth/auth.service"
import { ResponseTransformer } from "@/utils/helpers/response.transformer"
import { Request, Response } from "express"

@Controller("/auth")
class AuthController {
  @Post("/register")
  @ValidateBody(RegisterRequest)
  async register({ body }: Request, res: Response) {
    console.log(body)
    const user = await AuthService.register(body)

    const transformedResponse = ResponseTransformer.transform(UserResponse, { user })
    return res.status(201).json(transformedResponse)
  }

  @Post("/login")
  @ValidateBody(LoginRequest)
  async login({ body }: Request, res: Response) {
    const { user, token } = await AuthService.login(body)

    const transformedResponse = ResponseTransformer.transform(LoginResponse, { user, token })
    return res.json(transformedResponse)
  }
}

export { AuthController }
