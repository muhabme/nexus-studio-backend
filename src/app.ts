import cors from "cors"
import express, { Application } from "express"
import helmet from "helmet"
import path from "path"

import { rateLimiter } from "./middleware/auth/rateLimiter"
import { globalErrorHandler } from "./middleware/logging/errorLogger"
import corsConfig from "./middleware/security/cors"
import helmetConfig from "./middleware/security/helmet"

import { requestContext, requestLogger, requestStartTime } from "./middleware/logging/requestLogger"
import routes from "./routes"

const app: Application = express()

app.set("trust proxy", 1)

app.use(helmet(helmetConfig))
app.use(cors(corsConfig))

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

app.use(requestStartTime)
app.use(requestContext)
app.use(requestLogger)

app.use(rateLimiter, routes)

app.use("/uploads", express.static(path.join(__dirname, "../uploads")))

app.use(globalErrorHandler)

export default app
