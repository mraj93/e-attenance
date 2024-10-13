import {Request, Response, NextFunction} from "express"
import {getRandomWord} from "../utils/generateRandomWords";
import {catchAsyncErrors} from "../middlewares/catchAsyncErrors";
import userModel from "../models/user.models";
import workerModel from "../models/worker.model";
import {ErrorHandler} from "../utils/errorHandler";

export const createSupervisors = catchAsyncErrors(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {name, mobile, email, age, aadhar, uan, esic, address} = req.body
        if (!name || !mobile || !age || !uan || !aadhar || !uan) {
            return res.status(400).json({
                success: false,
                message: 'please provide all details of a user',
            })
        }

        // const isEmailExist = await workerModel.findOne({email: email})
        // if (isEmailExist) {
        //     return next(new ErrorHandler('Email already exists', 400))
        // }

        const randomPass = await getRandomWord()
        console.log(`random pass:`, randomPass)

        // return

        const workerData = {
            role: "supervisor",
            name: name,
            mobile: mobile,
            email: email,
            age: age,
            aadhar: aadhar,
            uan: uan || "",
            esic: esic || "",
            address: address,
            passText: randomPass,
            password: randomPass,
        }

        const newWorker = new workerModel(workerData)
        await newWorker.save()
            .then((res) => {
                console.log(`data saved successfully`)
            })
            .catch((err) => {
                console.error(`error`, err)
            })

        const resData = {
            email: email,
            passText: randomPass,
            password: randomPass
        }

        res.status(200).json({
            success: true,
            message: "worker created successfully",
            data: resData
        })
    } catch (err: any) {
        console.error(`error`, err)
        return res.status(500).json({
            success: false,
            error: err
        })
    }
})