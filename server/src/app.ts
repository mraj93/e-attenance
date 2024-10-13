import express, {NextFunction, Request, Response} from 'express'
import dotenv from 'dotenv'
import process from 'process'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import contractorRoutes from "./routes/contractor.routes";
import userRouter from './routes/user.routes'
import {errorMiddleware} from "./middlewares/error";

dotenv.config()

export const app = express()

app.use(express.json({limit: '50mb'}))
app.use(cookieParser())
app.use(
    cors({
        origin: process.env.ORIGIN,
    }),
)


app.use('/api/v1', userRouter)
app.use('/api/v1', contractorRoutes)

// Error handling middleware should be defined last
app.use(errorMiddleware);

// Testing routes
app.get('/test', async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: 'Api is working',
    })
})

app.all('*', (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any
    err.statusCode = 404
    res.status(404).json({
        message: 'Route not found',
    })
    next(err)
})
