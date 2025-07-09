import "dotenv/config"
import { Server } from "http"
import "reflect-metadata"
import app from "./src/app"

import {
  gracefulShutdown,
  uncaughtExceptionHandler,
  unhandledRejectionHandler,
} from "./src/middleware/logging/errorLogger"
import logger from "./src/utils/logger/winston"

const PORT = Number(process.env.PORT) || 3000

const initializeServices = async (): Promise<boolean> => {
  try {
    console.log("Services not implemented yet...")

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

    ;["SIGTERM", "SIGINT"].forEach((sig) => process.on(sig, gracefulShutdown(server)))

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
