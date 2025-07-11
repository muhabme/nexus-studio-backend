import jwt, { JwtPayload as BaseJwtPayload } from "jsonwebtoken"
import { StringValue } from "ms"

export interface JwtPayload extends BaseJwtPayload {
  id: number
  role: string

  iat?: number
  exp?: number
}

class JwtService {
  verify(token: string): JwtPayload {
    return jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
  }

  sign(payload: JwtPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRES_IN as StringValue,
    })
  }
}

export default new JwtService()
