import { getDatabaseConfig } from "@/config/database"
import { DatabaseConfig } from "@/types/database"
import knex, { Knex } from "knex"
import { Model } from "objection"
import logger from "../../utils/logger/winston"

export class DatabaseManager {
  private static instance: DatabaseManager
  private knexInstance: Knex | null = null
  private isConnected = false

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  public async connect(config?: Partial<DatabaseConfig>): Promise<Knex> {
    if (this.isConnected && this.knexInstance) {
      return this.knexInstance
    }

    try {
      const dbConfig = this.buildKnexConfig(config)
      this.knexInstance = knex(dbConfig)

      await this.testConnection()

      Model.knex(this.knexInstance)

      this.isConnected = true
      logger.info("✅ Database connected successfully")
      logger.info("✅ ObjectionJS initialized with Knex")

      return this.knexInstance
    } catch (error) {
      logger.error("❌ Database connection failed:", error)
      throw new Error(
        `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
    }
  }

  public async disconnect(): Promise<void> {
    if (this.knexInstance) {
      try {
        await this.knexInstance.destroy()
        this.knexInstance = null
        this.isConnected = false
        logger.info("✅ Database disconnected successfully")
      } catch (error) {
        logger.error("❌ Database disconnection failed:", error)
        throw error
      }
    }
  }

  public getKnex(): Knex {
    if (!this.knexInstance || !this.isConnected) {
      throw new Error("Database is not connected. Call connect() first.")
    }
    return this.knexInstance
  }

  public isConnectionActive(): boolean {
    return this.isConnected && this.knexInstance !== null
  }

  public async runMigrations(): Promise<void> {
    if (!this.knexInstance) {
      throw new Error("Database is not connected")
    }

    try {
      logger.info("🔄 Running database migrations...")
      await this.knexInstance.migrate.latest()
      logger.info("✅ Database migrations completed successfully")
    } catch (error) {
      logger.error("❌ Database migrations failed:", error)
      throw error
    }
  }

  public async runSeeds(): Promise<void> {
    if (!this.knexInstance) {
      throw new Error("Database is not connected")
    }

    try {
      logger.info("🔄 Running database seeds...")
      await this.knexInstance.seed.run()
      logger.info("✅ Database seeds completed successfully")
    } catch (error) {
      logger.error("❌ Database seeds failed:", error)
      throw error
    }
  }

  public async healthCheck(): Promise<{ status: string; timestamp: Date }> {
    try {
      if (!this.knexInstance) {
        throw new Error("Database not connected")
      }

      await this.knexInstance.raw("SELECT 1")
      return {
        status: "healthy",
        timestamp: new Date(),
      }
    } catch (error) {
      logger.error("❌ Database health check failed:", error)
      return {
        status: "unhealthy",
        timestamp: new Date(),
      }
    }
  }

  private buildKnexConfig(customConfig?: Partial<DatabaseConfig>): Knex.Config {
    const defaultConfig = getDatabaseConfig()

    const config = { ...defaultConfig, ...customConfig }

    return {
      client: "mysql2",
      connection: {
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database,
        charset: config.charset,
        timezone: config.timezone,
        multipleStatements: true,
      },
      migrations: config.migrations,
      seeds: config.seeds,
      debug: process.env.NODE_ENV === "development" && process.env.DB_DEBUG === "true",
      asyncStackTraces: process.env.NODE_ENV === "development",
    }
  }

  private async testConnection(): Promise<void> {
    if (!this.knexInstance) {
      throw new Error("Knex instance not initialized")
    }

    try {
      await this.knexInstance.raw("SELECT 1 + 1 AS result")
      logger.info("✅ Database connection test passed")
    } catch (error) {
      logger.error("❌ Database connection test failed:", error)
      throw error
    }
  }
}

export const databaseManager = DatabaseManager.getInstance()

export const connectDatabase = async (config?: Partial<DatabaseConfig>): Promise<Knex> => {
  const db = await databaseManager.connect(config)

  // if (process.env.NODE_ENV === "development") {
  //   await databaseManager.runMigrations()
  // }

  return db
}

export const getKnex = (): Knex => {
  return databaseManager.getKnex()
}
