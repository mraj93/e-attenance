import {Request, Response, NextFunction} from 'express';

export class ErrorHandler extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Middleware to handle all errors
export const errorMiddleware = (
    err: Error | ErrorHandler,
    req: Request,
    res: Response,
    next: NextFunction  // Include next for potential chaining
): void => {
    const statusCode = (err instanceof ErrorHandler ? err.statusCode : 500) || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Optional: include stack trace in development
    });
};
