import { Request, Response, NextFunction } from 'express'

export class ErrorHandler extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}

// Middleware to handle all errors
export const errorMiddleware = (
  err: ErrorHandler,
  req: Request,
  res: Response,
  // next: NextFunction,
): void => {
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
  })
}
