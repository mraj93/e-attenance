import dotenv from 'dotenv'
import {Response} from 'express'
import {IUser} from '../models/user.models'
import redisClient from './redis'

dotenv.config()

interface ITokenOptions {
    expires: Date
    maxAge: number
    httpOnly: boolean
    sameSite: 'lax' | 'strict' | 'none' | undefined
    secure?: boolean
}

// Parse the environment variables to the hold data
const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '1', 10)
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '3', 10)

// Options for cookies
export const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 1000),
    maxAge: accessTokenExpire * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
}

export const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
}

export const sendToken = async (
    user: IUser,
    // statusCode: number,
    res: Response,
) => {
    const accessToken = await user.SignAccessToken()
    const refreshToken = await user.SignRefreshToken()

    // Now upload session to Redis
    // try {
    //   // const reply = await redisClient.set(user._id, JSON.stringify(user) as any)
    //   // console.log('Redis set reply:', reply)
    // } catch (err: any) {
    //   console.error('Error setting Redis key:', err)
    // }
    // Only set secure to true production

    if (process.env.NODE_ENV === 'production') {
        accessTokenOptions.secure = true
    }

    res.cookie('access_token', accessToken, accessTokenOptions)
    res.cookie('refresh_token', refreshToken, refreshTokenOptions)

    console.log(`access_token are`, accessToken)
    console.log(`accessTokenOptions is`, accessTokenOptions)
    console.log(`refresh token`, refreshToken)
    console.log(`refreshTokenOptions`, refreshTokenOptions)

    return accessToken

    // res.status(statusCode).json({
    //   success: true,
    //   user,
    //   accessToken,
    // })
}
