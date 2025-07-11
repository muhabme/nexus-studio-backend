export interface DatabaseConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
  charset: string
  timezone: string

  migrations: {
    directory: string
    tableName: string
  }

  seeds: {
    directory: string
  }
}
