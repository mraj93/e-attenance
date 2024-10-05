// import { NextFunction, Request, Response } from 'express'
// import CourseModels from '../src/models/course.models'
// import { catchAsyncErrors } from '../src/middlewares/catchAsyncErrors'
//
// export const createCourse = catchAsyncErrors(
//   async (data: any, res: Response, next: NextFunction): Promise<void> => {
//     try {
//       const course = await CourseModels.create(data)
//       console.log(`course`, course)
//       res.status(201).json({
//         success: true,
//         data: 'Course created successfully',
//         course,
//       })
//     } catch (error: any) {
//       next(error)
//     }
//   },
// )
