import express from 'express'
import path from 'path'
import authroutes from './routes/auth.routes.js'
import dotenv from 'dotenv'
import connectMongoDb from './db/connectdb.js'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/user.routes.js'
import {v2 as cloudinary } from 'cloudinary' // used for uploading files (images & vidoes)
import postRoutes from './routes/post.routes.js'
import notifications from './routes/notification.routes.js'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
})

dotenv.config()

const app = express()
const port = process.env.PORT || 8000
const __dirname = path.resolve()

// limit should not be very high to avoid DOS[Denial of Service] attack
app.use(express.json({limit: '5mb'})) // to parse req.body
app.use(express.urlencoded({extended: true})) // to parse form data
app.use(cookieParser()) // to get our cookie for protected routes
app.use(cors())


app.use('/api/auth', authroutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/notification', notifications)

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, "/frontend/dist")))
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'))
    })
}

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
    connectMongoDb()
})

