import express from 'express'
import authroutes from './routes/auth.routes.js'
import dotenv from 'dotenv'
import connectMongoDb from './db/connectdb.js'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/user.routes.js'
import {v2 as cloudinary } from 'cloudinary' // used for uploading files (images & vidoes)
import postRoutes from './routes/post.routes.js'
import notifications from './routes/notification.routes.js'

dotenv.config()

const app = express()
const port = process.env.PORT || 8000

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
})

app.use(express.json()) // to parse req.body
app.use(express.urlencoded({extended: true})) // to parse form data
app.use(cookieParser()) // to get our cookie for protected routes


app.use('/api/auth', authroutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/notification', notifications)

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
    connectMongoDb()
})