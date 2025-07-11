import { User } from "@/models/User"

declare global {
  namespace Express {
    interface Request {
      startTime?: number
      requestId?: string
      user?: User
      rateLimit?: {
        resetTime: number
        remaining: number
        total: number
        used: number
      }
    }
  }
}

export {}
