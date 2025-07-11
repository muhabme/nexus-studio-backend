import { User } from "@/models/User"
import UserRepository from "@/repositories/UserRepository"
import HttpException from "@/utils/errors/HttpException"

class UsersService {
  async getProfile(userId: number): Promise<User> {
    const user = await UserRepository.findOneBy({ id: userId })

    if (!user) {
      throw HttpException.notFound("User not found")
    }

    return user
  }
}

export default new UsersService()
