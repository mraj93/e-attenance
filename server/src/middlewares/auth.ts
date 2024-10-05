import {Request, Response, NextFunction} from 'express'
import {catchAsyncErrors} from './catchAsyncErrors'
import {ErrorHandler} from '../utils/errorHandler'
import jwt, {JwtPayload} from 'jsonwebtoken'
import dotenv from 'dotenv'
import UserModels from "../models/user.models";
// import redisClient from '../utils/redis'

dotenv.config()

export const isAuthenticated = catchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // const access_token = req.cookies.access_token
            const access_token = req.cookies.access_token
            if (!access_token) {
                return next(
                    new ErrorHandler('Please login to access this resource', 400),
                )
            }

            console.log(access_token)

            const decoded: string | JwtPayload = jwt.verify(
                access_token,
                process.env.ACCESS_TOKEN as string,
            ) as JwtPayload
            if (!decoded || typeof decoded === 'string' || !decoded.id) {
                return next(new ErrorHandler('access token is not valid', 400))
            }
            // const user: string | null = await redisClient.get(decoded.id)
            const user = await UserModels.findById(decoded.id);

            if (!user) {
                return next(new ErrorHandler('user not found', 400))
            }
            // req.user = JSON.parse(user)
            console.log(`user :`, user)
            // console.log(`user`, req.user)
            next()
        } catch (err: any) {
            console.error(`err`, err)
            return next(new ErrorHandler('Internal Server Error', 500))
        }
    },
)

// export the USER role here
// export const authorizeRoles = catchAsyncErrors(async (...roles: string[]) => {
//   return (req: Request, res: Response, next: NextFunction) => {
//     if (!roles.includes(req.user?.role || '')) {
//       return next(
//         new ErrorHandler(
//           `user with role ${req.user.role} is not allowed to access this resource`,
//           400,
//         ),
//       )
//     }
//     next()
//   }
// })

// export const authorizeRoles = (...roles: string[]) => {
//   return catchAsyncErrors(
//     async (req: Request, res: Response, next: NextFunction) => {
//       if (!roles.includes(req.user?.role || '')) {
//         return next(
//           new ErrorHandler(
//             `user with role ${req.user.role} is not allowed to access this resource`,
//             400,
//           ),
//         )
//       }
//       next()
//     },
//   )
// }

export const isContractor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const access_token = req.cookies.access_token
        const decoded: string | JwtPayload = jwt.verify(
            access_token,
            process.env.ACCESS_TOKEN as string,
        ) as JwtPayload
        if (!decoded || typeof decoded === 'string' || !decoded.id) {
            return next(new ErrorHandler('access token is not valid', 400))
        }
        // const user: string | null = await redisClient.get(decoded.id)
        const user = await UserModels.findById(decoded.id);
        console.log(`user is:`, user)
    } catch (err: any) {
        console.error(`error`, err)
    }
}