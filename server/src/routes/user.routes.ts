import express from 'express'
import {activateUser, loginUser, logoutUser, registrationUser} from "../controllers/user.controller";
import {isAuthenticated, isContractor} from "../middlewares/auth";

const userRouter = express.Router()

userRouter.post('/registration', registrationUser)
userRouter.post('/active-user', activateUser)
userRouter.post('/login', loginUser)
userRouter.get('/logout', isAuthenticated, logoutUser)

userRouter.post('/create-supervisors', isContractor)

// userRouter.get('/refresh', updateAccessToken)
// userRouter.get('/me', isAuthenticated, getUserInfo)
// userRouter.post('/social-auth', getSocialAuth)
// userRouter.put('/update-user-info', isAuthenticated, updateUserInfo)
// userRouter.put('/update-user-password', isAuthenticated, updatePassword)
// userRouter.put('/update-user-avatar', isAuthenticated, updateProfilePicture)

export default userRouter
