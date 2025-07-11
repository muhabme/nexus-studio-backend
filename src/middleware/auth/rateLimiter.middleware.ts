import { HttpException } from "@/utils/errors/HttpException"
import { Request, Response } from "express"
import rateLimit from "express-rate-limit"

const keyGenerator = (req: Request): string => {
  if (req.user && req.user.id) {
    return `user:${req.user.id}`
  }

  return `ip:${req.ip}`
}

const rateLimitHandler = (_req: Request, _res: Response): void => {
  throw HttpException.tooManyRequests("Too many requests from this client. Please try again later.")
}

const skipRateLimit = (req: Request): boolean => {
  if (process.env.NODE_ENV === "test") {
    return true
  }

  if (req.path === "/health") {
    return true
  }

  if (req.path.startsWith("/api/webhooks")) {
    return true
  }

  return false
}

export const rateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: rateLimitHandler,
  skip: skipRateLimit,
})

export default rateLimiter
