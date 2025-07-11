import "reflect-metadata"

import cors from "cors"
import express, { Application } from "express"
import helmet from "helmet"

import { rateLimiter } from "./middleware/auth/rateLimiter.middleware"
import { endpointNotFoundMiddleware, globalErrorHandler } from "./middleware/logging/errorLogger"
import corsConfig from "./middleware/security/cors"
import helmetConfig from "./middleware/security/helmet"

import path from "path"
import { registerControllers } from "./controllers"
import { requestContext, requestLogger, requestStartTime } from "./middleware/logging/requestLogger"

const app: Application = express()

app.set("trust proxy", 1)

app.use(helmet(helmetConfig))
app.use(cors(corsConfig))

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

app.use(requestStartTime)
app.use(requestContext)
app.use(requestLogger)

registerControllers(app, { basePath: "/api/v1", globalMiddlewares: [rateLimiter] })

app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

app.use(/(.*)/, endpointNotFoundMiddleware)

app.use(globalErrorHandler)

export default app
