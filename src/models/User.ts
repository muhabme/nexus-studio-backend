import { UserRole } from "@/constants/userRoles.enum"
import { UserStatus } from "@/constants/userStatus.enum"
import { JSONSchema } from "objection"
import { BaseModel } from "./BaseModel"

export class User extends BaseModel {
  static override get tableName() {
    return "users"
  }

  email: string
  name: string
  password_hash: string

  role: UserRole
  status: UserStatus

  last_login_at: Date

  static override get jsonSchema(): JSONSchema {
    return {
      type: "object",
      required: ["email", "name", "password_hash"],

      properties: {
        id: { type: "integer" },
        created_at: { type: "string", format: "date-time", default: new Date().toISOString() },
        updated_at: { type: "string", format: "date-time", default: new Date().toISOString() },

        email: { type: "string", format: "email", maxLength: 255 },
        name: { type: "string", minLength: 1, maxLength: 255 },
        password_hash: { type: "string", minLength: 1, maxLength: 255 },

        role: { type: "string", enum: Object.values(UserRole), default: UserRole.USER },
        status: { type: "string", enum: Object.values(UserStatus), default: UserStatus.ACTIVE },

        last_login_at: { type: "string", format: "date-time" },
      },
    }
  }
}
