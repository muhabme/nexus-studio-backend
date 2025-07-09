import { HelmetOptions } from "helmet"

/**
 * Helmet configuration for security headers
 * Customized for an intelligent automation platform
 */
export const helmetConfig: HelmetOptions = {
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com",
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'", // Required for some AI/ML libraries
        "https://cdnjs.cloudflare.com",
        "https://apis.google.com",
      ],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "http:", // Allow HTTP images for web scraping results
      ],
      connectSrc: [
        "'self'",
        "https://api.openai.com",
        "https://hooks.slack.com",
        "https://slack.com",
        "wss://", // WebSocket connections
        "https://", // HTTPS APIs
      ],
      frameSrc: ["'self'", "https://accounts.google.com", "https://oauth.slack.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:"],
      childSrc: ["'none'"],
      workerSrc: ["'self'", "blob:"],
      manifestSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
    },
    // Report CSP violations in development
    reportOnly: process.env.NODE_ENV === "development",
  },

  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: {
    policy: "require-corp",
  },

  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: {
    policy: "same-origin",
  },

  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: {
    policy: "cross-origin", // Allow cross-origin requests for API
  },

  // DNS Prefetch Control
  dnsPrefetchControl: {
    allow: false,
  },

  // Hide X-Powered-By header
  hidePoweredBy: true,

  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },

  // IE No Open
  ieNoOpen: true,

  // Don't sniff MIME types
  noSniff: true,

  // Origin Agent Cluster
  originAgentCluster: true,

  // Referrer Policy
  referrerPolicy: {
    policy: ["same-origin", "strict-origin-when-cross-origin"],
  },

  // X-Frame-Options
  frameguard: {
    action: "deny",
  },

  // X-XSS-Protection (legacy but still useful)
  xssFilter: true,
}

/**
 * Development-specific helmet configuration
 * More permissive for development and testing
 */
export const helmetConfigDev: HelmetOptions = {
  ...helmetConfig,
  contentSecurityPolicy: {
    directives: {
      ...(
        helmetConfig.contentSecurityPolicy as Exclude<
          HelmetOptions["contentSecurityPolicy"],
          boolean
        >
      )?.directives,
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://cdnjs.cloudflare.com",
        "https://apis.google.com",
        "http://localhost:*", // Allow local development
      ],
      connectSrc: [
        "'self'",
        "https://api.openai.com",
        "https://hooks.slack.com",
        "https://slack.com",
        "wss://",
        "https://",
        "http://localhost:*", // Allow local APIs
        "ws://localhost:*", // Allow local WebSocket
      ],
      upgradeInsecureRequests: null,
    },
    reportOnly: true,
  },
  hsts: false, // Disable HSTS in development
}

/**
 * Production-specific helmet configuration
 * Stricter security for production environment
 */
export const helmetConfigProd: HelmetOptions = {
  ...helmetConfig,
  contentSecurityPolicy: {
    directives: {
      ...(
        helmetConfig.contentSecurityPolicy as Exclude<
          HelmetOptions["contentSecurityPolicy"],
          boolean
        >
      )?.directives,
      upgradeInsecureRequests: [],
    },
    reportOnly: false,
  },
  hsts: {
    maxAge: 63072000, // 2 years
    includeSubDomains: true,
    preload: true,
  },
}

/**
 * Get helmet configuration based on environment
 */
export const getHelmetConfig = (): HelmetOptions => {
  switch (process.env.NODE_ENV) {
    case "production":
      return helmetConfigProd
    case "development":
      return helmetConfigDev
    default:
      return helmetConfig
  }
}

// Export default configuration
export default getHelmetConfig()
