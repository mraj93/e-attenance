import dotenv from 'dotenv'
// import { v2 as cloudinary } from 'cloudinary'
import { app } from './app'
import { connectDB } from './utils/connectDB'

dotenv.config()

// console.log(process.env.CLOUDINARY_API_NAME)
// console.log(process.env.CLOUDINARY_API_KEY)
// console.log(process.env.CLOUDINARY_API_SECRET)

// // Cloudinary Configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_API_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// })

app.listen(process.env.PORT, async () => {
  console.log(`server is connected with port ${process.env.PORT}`)
  await connectDB()
})
