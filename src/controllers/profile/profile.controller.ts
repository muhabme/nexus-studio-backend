import { Controller, Get, UseMiddleware } from "@/decorators/router-system"
import { authenticatedUserMiddleware } from "@/middleware/auth/authenticated.middleware"
import usersService from "@/services/users/users.service"
import HttpException from "@/utils/errors/HttpException"
import { Request, Response } from "express"

@Controller("/profile")
@UseMiddleware(authenticatedUserMiddleware)
class ProfileController {
  @Get()
  async register({ user: currentUser }: Request, res: Response) {
    if (!currentUser) {
      throw HttpException.unauthorized()
    }

    const user = await usersService.getProfile(currentUser.id)

    return res.status(201).json({
      success: true,
      user,
    })
  }
}

export { ProfileController }
