import dotenv from 'dotenv'

dotenv.config()
import mongoose, {Document, Model, Schema} from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const emailRegex: RegExp =
    /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/

export interface IUser extends Document {
    name: string
    email: string
    password: string
    avatar: {
        public_id: string
        url: string
    }
    role: string
    isVerified: boolean
    courses: Array<{ courseId: string }>
    comparePassword: (password: string) => Promise<boolean>
    SignAccessToken: () => string
    SignRefreshToken: () => string
}

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter your name'],
        },
        email: {
            type: String,
            required: [true, 'Please enter your email'],
            unique: true,
            validate: {
                validator: function (value: string) {
                    return emailRegex.test(value)
                },
                message: 'Please enter a valid email id',
            },
        },
        password: {
            type: String,
            // required: [true, 'Please enter password'],
            minlength: [5, 'Password must be at least 6 characters'],
            select: false,
        },
        avatar: {
            public_id: String,
            url: String,
        },
        role: {
            type: String,
            default: 'contractor',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        courses: [
            {
                courseId: String,
            },
        ],
    },
    {timestamps: true},
)

userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.SignAccessToken = async function () {
    return jwt.sign({id: this._id}, process.env.ACCESS_TOKEN || '', {
        expiresIn: '5m',
    })
}

userSchema.methods.SignRefreshToken = async function () {
    return jwt.sign({id: this._id}, process.env.REFRESH_TOKEN || '', {
        expiresIn: '3d',
    })
}

userSchema.methods.comparePassword = async function (
    enteredPassword: string,
): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password)
}

const userModel = mongoose.model('User', userSchema)
export default userModel
