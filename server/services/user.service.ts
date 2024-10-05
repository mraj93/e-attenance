// import { Response, NextFunction } from 'express'
// import { ErrorHandler } from '../src/utils/errorHandler'
// import redisClient from '../src/utils/redis'
//
// export const getUserById = async (
//   userId: string,
//   res: Response,
//   next: NextFunction,
// ): Promise<any> => {
//   try {
//     const getUserInfo = await redisClient.get(userId)
//     const user = JSON.parse(getUserInfo!)
//     console.log(`user info is`, user)
//     res.status(200).json({
//       success: true,
//       user,
//     })
//   } catch (err: any) {
//     console.error(`error`, err)
//     return next(new ErrorHandler(err.message, 400))
//   }
// }
