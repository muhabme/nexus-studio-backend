import { AppError } from "@/utils/errors/AppError"
import { Request, Response } from "express"
import rateLimit from "express-rate-limit"

const keyGenerator = (req: Request): string => {
  if (req.user && req.user.id) {
    return `user:${req.user.id}`
  }

  return `ip:${req.ip}`
}

const rateLimitHandler = (req: Request, res: Response): void => {
  const error = new AppError("Too many requests from this client. Please try again later.", 429)

  console.log(req.rateLimit)

  res.status(429).json({
    status: "error",
    message: error.message,
    retryAfter: new Date(req.rateLimit?.resetTime || 0),
  })
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
  message: "Too many requests from this client. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: rateLimitHandler,
  skip: skipRateLimit,
})

export default rateLimiter
