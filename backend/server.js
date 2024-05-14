import express from 'express'
import authroutes from './routes/auth.routes.js'
import dotenv from 'dotenv'
import connectMongoDb from './db/connectdb.js'
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express()
const port = process.env.PORT || 8000

app.use(express.json()) // to parse req.body
app.use(express.urlencoded({extended: true})) // to parse form data
app.use(cookieParser()) // to get our cookie for protected routes
app.use('/api/auth', authroutes)

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
    connectMongoDb()
})