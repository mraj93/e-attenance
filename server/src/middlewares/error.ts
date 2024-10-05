import { ErrorHandler } from '../utils/errorHandler'
import { Request, Response, NextFunction } from 'express'

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  err.statusCode = err.statusCode || 500
  err.message = err.message || 'Internal server error'

  // wrong mongodb id error
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid ${err.path}`
    err = new ErrorHandler(message, 400)
  }

  // Duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`
    err = new ErrorHandler(message, 400)
  }

  //wrong jwt error
  if (err.name === 'JsonWebTokenError') {
    const message = `Json web token is invalid, try again`
    err = new ErrorHandler(message, 400)
  }

  //JWT Expire
  if (err.name === 'TokenExpiredError') {
    const message = `Json web token is expired`
    err = new ErrorHandler(message, 400)
  }

  res.status(400).json({
    success: false,
    message: err.message,
  })
}
