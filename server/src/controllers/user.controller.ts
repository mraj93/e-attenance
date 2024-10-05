import dotenv from 'dotenv'
import sendMail from '../utils/sendMail'
import {Request, Response, NextFunction} from 'express'
import userModel, {IUser} from '../models/user.models'
import {ErrorHandler} from '../utils/errorHandler'
import ejs from 'ejs'
import jwt, {JwtPayload, Secret} from 'jsonwebtoken'
import path from 'path'
import UserModels from '../models/user.models'
import {
    accessTokenOptions,
    refreshTokenOptions,
    sendToken,
} from '../utils/jwt'
import {catchAsyncErrors} from '../middlewares/catchAsyncErrors'
import redisClient from '../utils/redis'
// import { getUserById } from '../../services/user.service'
import userModels from '../models/user.models'
import cloudinary from 'cloudinary'

dotenv.config()

interface IActivationToken {
    token: string
    activationCode: string
}

interface ISocialAuthBody {
    name: string
    avatar: string
    email: string
}

interface IRegistrationBody {
    name: string
    email: string
    password: string
    avatar?: string
}

interface IActivationRequest {
    activation_token: string
    activation_code: string
}

interface ILoginRequest {
    email: string
    password: string
}

interface IUploadAvatar {
    avatar: string
}

interface IUpdateUserInfo {
    name: string
    email: string
}

export const registrationUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const {name, email, password}: IRegistrationBody = req.body
        console.log(`body is:`, req.body)

        const isEmailExist = await userModel.findOne({email})
        if (isEmailExist) {
            return next(new ErrorHandler('Email already exists', 400))
        }
        const user: IRegistrationBody = {
            name,
            email,
            password,
        }
        const activationToken = createActivationToken(user)
        console.log(`activation token:`, activationToken)

        // return

        const activationCode = activationToken.activationCode
        const data = {user: {name: user.name}, activationCode}
        console.log('data', data)

        const html = await ejs.renderFile(
            path.join(__dirname, '../templates/activation-mail.ejs'),
            data,
        )
        try {
            await sendMail({
                email: user.email,
                subject: 'Activate your account',
                template: 'activation-mail.ejs',
                data,
            })
            res.status(201).json({
                success: true,
                message: `Please check your email:${user.email} to activate your account`,
                activationToken: activationToken.token,
            })
        } catch (err: any) {
            if (err instanceof Error) {
                console.log('error', err)
            }
            return next(new ErrorHandler(err.message, 500))
        }
    } catch (err: any) {
        console.log('e', err)
        return next(new ErrorHandler(err.message, 400))
    }
}

interface IUpdatePassword {
    oldPassword: string
    newPassword: string
}

export const createActivationToken = (user: IUser): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString()
    const token = jwt.sign(
        {
            user,
            activationCode,
        },
        process.env.ACTIVATION_SECRET as Secret,
        {
            expiresIn: '15m',
        },
    )
    return {token, activationCode}
}

export const activateUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const {activation_token, activation_code} = req.body as IActivationRequest
        const newUser: { user: IUser; activationCode: string } = jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET as string,
        ) as { user: IUser; activationCode: string }

        console.log('activation_code', activation_code)
        console.log('activation_code', newUser.activationCode)

        if (newUser.activationCode !== activation_code) {
            return next(new ErrorHandler('Invalid activation code', 400))
        }
        const {name, email, password} = newUser.user
        const existUser = await userModel.findOne({email})
        if (existUser) {
            return next(
                res.status(404).json(new ErrorHandler('User already exist', 400)),
            )
        }
        const user = await userModel.create({
            name,
            email,
            password,
        })
        res.status(201).json({
            success: true,
        })
    } catch (err: any) {
        console.error('error', err)
        return next(res.status(500).json(new ErrorHandler(err, 500)))
    }
}

export const loginUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const {email, password, isContractor, isSuperVisor} = req.body as ILoginRequest
        if (!email || !password) {
            return next(
                res.status(404)
                    .json(
                        new ErrorHandler('Please enter correct email and password', 400),
                    ),
            )
        }
        const user = await UserModels.findOne({email}).select('+password')
        if (!user) {
            return next(new ErrorHandler('Invalid email or password', 400))
        }
        const isPasswordMatch = await user.comparePassword(password)
        if (!isPasswordMatch) {
            return next(new ErrorHandler('Invalid email or password', 404))
        }
        console.log(`isPasswordMatch: ${isPasswordMatch}`)
        const accessToken = await sendToken(user, res)
        const userRole = {
            isContractor: isContractor,
            isSupervisor: isSuperVisor,
        }
        const data = {userRole}
        res.status(200).json({
            success: true,
            user,
            accessToken,
            data
        })
        console.log(`user details`, user)
        // await sendToken(user, 200, res)
    } catch (err: any) {
        // return next(res.status(404).json(new ErrorHandler(err)))
        return next(new ErrorHandler(err, 404))
    }
}

export const logoutUser = catchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            // res.cookie('access_token', '', { maxAge: 1 })
            // res.cookie('refresh_token', '', { maxAge: 1 })
            // const userId = req.user?._id
            //
            // console.log(`userId`, userId)
            //
            // if (!userId) {
            //   return next(new ErrorHandler('User ID not found', 400))
            // }
            // // const reply = await redisClient.del(userId)
            // // console.log(`Redis delete response`, reply)
            // res.status(200).json({
            //   success: true,
            //   message: 'user logged out successfully',
            // })

            res.clearCookie('access_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Enable secure in production
                sameSite: 'strict', // For additional security
            });

            res.clearCookie('refresh_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });

            res.status(200).json({
                success: true,
                message: 'Logged out successfully',
            });
        } catch (err: any) {
            return next(new ErrorHandler(err.message, 400))
        }
    },
)

//
// // Update the access token
// export const updateAccessToken = catchAsyncErrors(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const refresh_token = req.cookies.refresh_token as string
//       const decoded = jwt.verify(
//         refresh_token,
//         process.env.REFRESH_TOKEN as string,
//       ) as JwtPayload
//
//       const message = 'Could not refresh the token'
//       if (!decoded) {
//         return next(new ErrorHandler(message, 400))
//       }
//       const session = await redisClient.get(decoded.id as string)
//       if (!session) {
//         return next(new ErrorHandler(message, 400))
//       }
//       const user = JSON.parse(session)
//       const accessToken = jwt.sign(
//         { id: user._id },
//         process.env.ACCESS_TOKEN as string,
//         {
//           expiresIn: '5m',
//         },
//       )
//       const refreshToken = jwt.sign(
//         { id: user._id },
//         process.env.REFRESH_TOKEN as string,
//         {
//           expiresIn: '3d',
//         },
//       )
//       req.user = user
//       res.cookie('access_token', accessToken, accessTokenOptions)
//       res.cookie('refresh_token', refreshToken, refreshTokenOptions)
//       res.status(200).json({
//         status: 'success',
//         accessToken,
//       })
//     } catch (err: any) {
//       console.error(`Error`, err)
//       return next(new ErrorHandler(err.message, 400))
//     }
//   },
// )
//
// export const getUserInfo = catchAsyncErrors(
//   async (req: Request, res: Response, next: NextFunction): Promise<any> => {
//     try {
//       const userId = req.user?._id
//       await getUserById(userId, res, next)
//     } catch (err: any) {
//       console.error(`Error is`, err)
//       return next(new ErrorHandler('Unable to get user info', 400))
//     }
//   },
// )
//
// export const getSocialAuth = catchAsyncErrors(
//   async (req: Request, res: Response, next: NextFunction): Promise<any> => {
//     try {
//       const { name, email, avatar } = req.body as ISocialAuthBody
//       const user = await userModel.findOne({ email })
//       if (!user) {
//         const newUser = await userModel.create({ email, name, avatar })
//         await sendToken(newUser, 200, res)
//       } else {
//         await sendToken(user, 200, res)
//       }
//     } catch (err: any) {
//       console.error(`error`, err)
//       return next(new ErrorHandler(err, 400))
//     }
//   },
// )
//
// export const updateUserInfo = catchAsyncErrors(
//   async (req: Request, res: Response, next: NextFunction): Promise<any> => {
//     try {
//       const { name, email } = req.body as IUpdateUserInfo
//       const userId = req.user?._id
//       const user = await userModel.findById(userId)
//       if (email && user) {
//         const isEmailExists = await userModel.findOne({ email })
//         if (isEmailExists) {
//           return next(
//             new ErrorHandler('email already exist, email updated failed!', 400),
//           )
//         }
//         user.email = email
//       }
//       if (user && name) {
//         user.name = name
//       }
//       await user?.save()
//       await redisClient.set(userId, JSON.stringify(user))
//       res.status(200).json({
//         success: true,
//         user,
//       })
//     } catch (err: any) {
//       console.error('err', err)
//       return next(new ErrorHandler(err, 400))
//     }
//   },
// )
//
// export const updatePassword = catchAsyncErrors(
//   async (req: Request, res: Response, next: NextFunction): Promise<any> => {
//     try {
//       const { oldPassword, newPassword } = req.body as IUpdatePassword
//       if (!oldPassword || !newPassword) {
//         return next(
//           new ErrorHandler('Please enter both passwords to continue', 400),
//         )
//       }
//       const user = await userModel.findById(req.user?._id).select('+password')
//       if (user?.password === undefined) {
//         return next(new ErrorHandler('Invalid user', 400))
//       }
//       const isPasswordMatch = await user?.comparePassword(oldPassword)
//       if (!isPasswordMatch) {
//         return next(new ErrorHandler('Invalid old password', 400))
//       }
//       user.password = newPassword
//       await user?.save()
//       await redisClient.set(req.user?._id, JSON.stringify(user))
//       res.status(201).json({
//         success: true,
//         user,
//       })
//     } catch (err: any) {
//       console.error(`err`, err)
//       return next(new ErrorHandler(err, 400))
//     }
//   },
// )
//
// export const updateProfilePicture = catchAsyncErrors(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { avatar } = req.body as IUploadAvatar
//       const user = req.user
//
//       console.log('here')
//
//       if (avatar && user) {
//         console.log(`in first if`)
//         if (user?.avatar?.public_id) {
//           console.log(`in second if body`)
//           await cloudinary.v2.uploader.destroy(user?.avatar?.public_id)
//           const myCloud = await cloudinary.v2.uploader.upload(avatar, {
//             folder: 'avatars',
//             width: 100,
//           })
//           user.avatar = {
//             public_id: myCloud.public_id,
//             url: myCloud.secure_url,
//           }
//         } else {
//           const myCloud = await cloudinary.v2.uploader.upload(avatar, {
//             folder: 'avatars',
//             width: 100,
//           })
//           user.avatar = {
//             public_id: myCloud.public_id,
//             url: myCloud.secure_url,
//           }
//         }
//       }
//       await user?.save()
//       await redisClient.set(req.user?._id, JSON.stringify(user))
//       res.status(200).json({
//         success: true,
//         user,
//       })
//     } catch (err: any) {
//       console.error(`error`, err)
//       return next(new ErrorHandler(err, 400))
//     }
//   },
// )
