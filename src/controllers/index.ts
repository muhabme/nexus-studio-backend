import { registerRoutes, type RegisterRoutesOptions } from "@/decorators/router-system"
import { Application } from "express"
import { AuthController } from "./auth/auth.controller"
import { ProfileController } from "./profile/profile.controller"

const controllers = [AuthController, ProfileController]

const registerControllers = (app: Application, options: RegisterRoutesOptions = {}) => {
  controllers.forEach((controller) => {
    registerRoutes(app, options, controller)
  })
}

export { registerControllers }
