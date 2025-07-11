import { DatabaseConfig } from "@/types/database"
import { config } from "dotenv"
import { Knex } from "knex"
import path from "path"

const projectRoot = path.resolve(__dirname, "..", "..")

config({ path: path.resolve(projectRoot, ".env"), quiet: true })

export const getDatabaseConfig = (): Partial<DatabaseConfig> => {
  const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT!, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    charset: process.env.DB_CHARSET,
    timezone: process.env.DB_TIMEZONE,

    migrations: {
      directory: path.resolve(projectRoot, "database", "migrations"),
      tableName: "migrations",
    },

    seeds: {
      directory: path.resolve(projectRoot, "database", "seeds"),
    },
  }

  return dbConfig
}

const buildKnexConfig = (dbConfig: Partial<DatabaseConfig>): Knex.Config => {
  return {
    client: "mysql2",
    connection: {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      charset: dbConfig.charset,
      timezone: dbConfig.timezone,
      multipleStatements: true,
    },

    debug: process.env.NODE_ENV === "development" && process.env.DB_DEBUG === "true",
    asyncStackTraces: process.env.NODE_ENV === "development",

    migrations: dbConfig.migrations,
    seeds: dbConfig.seeds,
  }
}

const dbConfig = getDatabaseConfig()
const knexConfig = buildKnexConfig(dbConfig)

export default {
  development: knexConfig,
  production: knexConfig,
  test: knexConfig,
}

export { knexConfig }
