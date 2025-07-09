import cors from "cors"
import { Request } from "express"

/**
 * CORS configuration for the intelligent automation platform
 * Handles cross-origin requests from frontend applications and external integrations
 */

// Define allowed origins based on environment
const getAllowedOrigins = (): (string | RegExp)[] => {
  const baseOrigins = [
    process.env.FRONTEND_URL || "http://localhost:3000",
    process.env.ADMIN_URL || "http://localhost:3001",
    process.env.DOCS_URL || "http://localhost:3002",
  ]

  // Environment-specific origins
  switch (process.env.NODE_ENV) {
    case "production":
      return [
        ...baseOrigins,
        "https://yourdomain.com",
        "https://app.yourdomain.com",
        "https://admin.yourdomain.com",
        "https://docs.yourdomain.com",
        // Add your production domains
      ]

    case "staging":
      return [
        ...baseOrigins,
        "https://staging.yourdomain.com",
        "https://app-staging.yourdomain.com",
        "https://admin-staging.yourdomain.com",
        // Add your staging domains
      ]

    case "development":
    default:
      return [
        ...baseOrigins,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5173", // Vite dev server
        "http://localhost:8080", // Webpack dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        // Allow any localhost port in development
        /^http:\/\/localhost:\d+$/,
        /^http:\/\/127\.0\.0\.1:\d+$/,
      ]
  }
}

/**
 * Dynamic origin checker
 * Validates origins based on environment and configuration
 */
const originChecker = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
) => {
  const allowedOrigins = getAllowedOrigins()

  // Allow requests with no origin (mobile apps, Postman, etc.)
  if (!origin) {
    return callback(null, true)
  }

  // Check if origin is in allowed list
  const isAllowed = allowedOrigins.some((allowedOrigin) => {
    if (typeof allowedOrigin === "string") {
      return origin === allowedOrigin
    } else if (allowedOrigin instanceof RegExp) {
      return allowedOrigin.test(origin)
    }

    return false
  })

  if (isAllowed) {
    callback(null, true)
  } else {
    callback(new Error(`Origin ${origin} not allowed by CORS policy`), false)
  }
}

/**
 * Base CORS configuration
 */
export const corsConfig: cors.CorsOptions = {
  origin: originChecker,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-Request-ID",
    "X-Execution-ID",
    "X-Workflow-ID",
    "X-API-Key",
    "X-User-Agent",
    "Accept",
    "Origin",
  ],
  exposedHeaders: [
    "X-Request-ID",
    "X-RateLimit-Limit",
    "X-RateLimit-Remaining",
    "X-RateLimit-Reset",
    "X-Total-Count",
    "X-Page-Count",
    "Link",
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200,
  preflightContinue: false,
}

/**
 * Development CORS configuration
 * More permissive for development and testing
 */
export const corsConfigDev: cors.CorsOptions = {
  ...corsConfig,
  origin: true, // Allow all origins in development
  credentials: true,
  optionsSuccessStatus: 200,
}

/**
 * Production CORS configuration
 * Stricter security for production environment
 */
export const corsConfigProd: cors.CorsOptions = {
  ...corsConfig,
  origin: originChecker,
  credentials: true,
  maxAge: 86400, // 24 hours
}

/**
 * API-specific CORS configuration
 * For API endpoints that need different CORS settings
 */
export const corsConfigAPI: cors.CorsOptions = {
  ...corsConfig,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: [...corsConfig.allowedHeaders!, "X-API-Version", "X-Client-Version"],
}

/**
 * Webhook CORS configuration
 * For webhook endpoints that receive external requests
 */
export const corsConfigWebhook: cors.CorsOptions = {
  origin: false, // Disable CORS for webhooks
  methods: ["POST"],
  allowedHeaders: [
    "Content-Type",
    "X-Signature",
    "X-Hub-Signature",
    "X-Hub-Signature-256",
    "X-Slack-Signature",
    "X-Slack-Request-Timestamp",
    "User-Agent",
  ],
  credentials: false,
  maxAge: 0,
}

/**
 * Public API CORS configuration
 * For public endpoints that should be accessible from anywhere
 */
export const corsConfigPublic: cors.CorsOptions = {
  origin: true,
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization", "X-API-Key", "X-Requested-With"],
  credentials: false,
  maxAge: 3600, // 1 hour
}

/**
 * Dynamic CORS configuration based on request
 */
export const dynamicCorsConfig = (req: Request): cors.CorsOptions => {
  const path = req.path

  // Webhook endpoints
  if (path.startsWith("/webhooks/")) {
    return corsConfigWebhook
  }

  // Public API endpoints
  if (path.startsWith("/api/public/")) {
    return corsConfigPublic
  }

  // API endpoints
  if (path.startsWith("/api/")) {
    return corsConfigAPI
  }

  // Default configuration
  return getCorsConfig()
}

/**
 * Get CORS configuration based on environment
 */
export const getCorsConfig = (): cors.CorsOptions => {
  switch (process.env.NODE_ENV) {
    case "production":
      return corsConfigProd
    case "development":
      return corsConfigDev
    default:
      return corsConfig
  }
}

/**
 * CORS middleware factory
 * Creates CORS middleware with custom configuration
 */
export const createCorsMiddleware = (config?: cors.CorsOptions) => {
  return cors(config || getCorsConfig())
}

/**
 * Conditional CORS middleware
 * Only applies CORS to specific routes or conditions
 */
export const conditionalCors = (
  condition: (req: Request) => boolean,
  config?: cors.CorsOptions,
) => {
  const corsMiddleware = createCorsMiddleware(config)

  return (req: Request, res: any, next: any) => {
    if (condition(req)) {
      return corsMiddleware(req, res, next)
    }
    next()
  }
}

export default getCorsConfig()
