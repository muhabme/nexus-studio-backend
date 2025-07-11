import { User } from "@/models/User"
import { BaseRepository } from "../integrations/databases/BaseRepository"

class UserRepository extends BaseRepository<User> {
  protected model = User

  async updateLastLogin(userId: number): Promise<void> {
    await this.update(userId, { last_login_at: new Date() })
  }
}

export default new UserRepository()
