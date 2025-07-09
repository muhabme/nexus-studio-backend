import { NextFunction, Request, Response, Router } from "express"
// import webhookRoutes from './webhooks';
import { endpointNotFoundMiddleware } from "@/middleware/logging/errorLogger"
import apiRoutes from "./api"

const router: Router = Router()

router.get("/health", (_req: Request, res: Response, _next: NextFunction) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || "1.0.0",
  })
})

// API routes
router.use(apiRoutes)

// Webhook routes
// router.use('/webhooks', webhookRoutes);

// 404 handler for API routes
router.use(/(.*)/, endpointNotFoundMiddleware)

export default router
