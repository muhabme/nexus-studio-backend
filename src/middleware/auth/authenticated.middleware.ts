import UserRepository from "@/repositories/UserRepository"
import JwtService, { JwtPayload } from "@/services/auth/jwt.service"
import HttpException from "@/utils/errors/HttpException"
import logger from "@/utils/logger/winston"
import { NextFunction, Request, Response } from "express"

const authenticatedUserMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw HttpException.unauthorized("Missing or invalid Authorization header")
    }

    const token = authHeader.slice(7)
    let payload: JwtPayload
    try {
      payload = JwtService.verify(token)
    } catch {
      throw HttpException.unauthorized("Invalid or expired token")
    }

    if (payload.role !== "user") {
      throw HttpException.forbidden("Insufficient permissions")
    }

    const user = await UserRepository.findOneBy({ id: payload.id })

    if (!user) {
      throw HttpException.notFound("User not found")
    }

    req.user = user

    return next()
  } catch (err) {
    if (err instanceof HttpException) {
      throw err
    }

    logger.error("Auth middleware error", err)
    throw HttpException.internal("Internal server error")
  }
}

export { authenticatedUserMiddleware }
