import bcrypt from "bcrypt"

class PasswordService {
  private static readonly SALT_ROUNDS = 10

  public async hash(plainPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt(PasswordService.SALT_ROUNDS)

    return bcrypt.hash(plainPassword, salt)
  }

  public async verify(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash)
  }
}

export default new PasswordService()
