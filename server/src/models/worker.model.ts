import mongoose, {Schema} from "mongoose";
import exp from "node:constants";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {IUser} from "./user.models";

export interface IWorker extends Document {
    role: string,
    name: string,
    mobile: number,
    passText: string,
    password?: string,
    isPasswordChanged?: boolean,
    email: string,
    age: number,
    aadhar: number,
    uan?: number,
    esic?: number,
    address: string
}

const workerSchema = new Schema({
        role: {
            type: String,
        },
        name: {
            type: String,
            required: [true, 'please provide a worker name'],
        },
        mobile: {
            type: Number,
            required: [true, 'please provide a mobile number'],
        },
        email: {
            type: String
        },
        passText: {
            type: String
        },
        password: {
            type: String,
        },
        isPasswordChanged: {
            type: Boolean,
            default: false,
        },
        age: {
            type: Number,
            required: [true, 'please enter your age'],
        },
        aadhar: {
            type: Number,
            validate: {
                validator: function (value: number) {
                    return value.toString().length === 12;
                },
                message: 'Aadhaar number must be exactly 12 digits',
            }
        },
        uan: {
            type: Number,
        },
        esic: {
            type: Number
        },
        address: {
            type: String,
            required: [true, 'please provide a address'],
        }
    },
    {timestamps: true}
)

workerSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

workerSchema.methods.SignAccessToken = async function () {
    return jwt.sign({id: this._id}, process.env.ACCESS_TOKEN || '', {
        expiresIn: '5m',
    })
}

workerSchema.methods.SignRefreshToken = async function () {
    return jwt.sign({id: this._id}, process.env.REFRESH_TOKEN || '', {
        expiresIn: '3d',
    })
}

workerSchema.methods.comparePassword = async function (
    enteredPassword: string,
): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password)
}

const workerModel = mongoose.model('Worker', workerSchema)
export default workerModel

