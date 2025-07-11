import logger from "@/utils/logger/winston"
import { Handler, NextFunction, Request, Response } from "express"
import morgan from "morgan"

morgan.token("user-id", (req: Request) => {
  return req.user?.id?.toString() || "anonymous"
})

morgan.token("execution-id", (req: Request) => {
  return (req.headers["x-execution-id"] as string) || "none"
})

morgan.token("workflow-id", (req: Request) => {
  return (req.headers["x-workflow-id"] as string) || "none"
})

morgan.token("response-time-ms", (req: Request, _res: Response) => {
  const startTime = req.startTime || Date.now()
  return `${Date.now() - startTime}ms`
})

const logFormat = [
  ":method :url",
  "HTTP/:http-version",
  "Status: :status",
  "User: :user-id",
  "Execution: :execution-id",
  "Workflow: :workflow-id",
  "Response: :response-time-ms",
  "Content-Length: :res[content-length]",
  "User-Agent: :user-agent",
  "IP: :remote-addr",
].join(" | ")

export const requestLogger: Handler = morgan(logFormat, {
  stream: {
    write: (message: string) => {
      const cleanMessage = message.trim()

      logger.http(cleanMessage)
    },
  },
  skip: (_req: Request, _res: Response) => {
    return false
  },
})

export const requestStartTime = (req: Request, _res: Response, next: NextFunction) => {
  req.startTime = Date.now()
  next()
}

export const requestContext = (req: Request, res: Response, next: NextFunction) => {
  req.requestId =
    (req.headers["x-request-id"] as string) ||
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  res.setHeader("X-Request-ID", req.requestId)

  next()
}
