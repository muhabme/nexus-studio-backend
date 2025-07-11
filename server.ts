import "dotenv/config"
import { Server } from "http"
import app from "./src/app"

import { config } from "dotenv"
import path from "path"

config({ path: path.resolve(__dirname, `.env`), quiet: true })

import { connectDatabase, databaseManager } from "./src/integrations/databases/mysql"

import {
  gracefulShutdown,
  uncaughtExceptionHandler,
  unhandledRejectionHandler,
} from "./src/middleware/logging/errorLogger"
import logger from "./src/utils/logger/winston"

const PORT = Number(process.env.PORT) || 3000

const initializeServices = async (): Promise<boolean> => {
  try {
    // Connect to database
    await connectDatabase()
    logger.info("Database connected successfully")

    return true
  } catch (error) {
    logger.error("Failed to initialize services:", error)
    throw error
  }
}

const startServer = async (): Promise<Server> => {
  try {
    await initializeServices()

    process.on("unhandledRejection", unhandledRejectionHandler)
    process.on("uncaughtException", uncaughtExceptionHandler)

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`)
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`)
      logger.info(`📋 API Version: ${process.env.API_VERSION}`)
      logger.info(`🔗 Health Check: http://localhost:${PORT}/health`)
    })

    const handleShutdown = gracefulShutdown(server)

    ;["SIGTERM", "SIGINT"].forEach((signal) => {
      process.on(signal, async () => {
        logger.info(`📥 Received ${signal}, starting graceful shutdown...`)

        try {
          await databaseManager.disconnect()
          logger.info("✅ Database disconnected successfully")
        } catch (error) {
          logger.error("❌ Error disconnecting database:", error)
        }

        handleShutdown(signal)
      })
    })

    return server
  } catch (error) {
    logger.error("Failed to start server:", error)
    process.exit(1)
  }
}

// eslint-disable-next-line no-unused-vars
let server: Server

startServer().then((s) => {
  server = s
})
