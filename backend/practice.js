import mongoose from "mongoose";
import express from 'express'
import jwt from 'jsonwebtoken'
import User from "./models/userModel";

const app = express()
const port = process.env.PORT || 5000



const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL)
        console.log(`MongoDB connected to host ${conn.connection.host}`)
    } catch (error) {
        console.log(`Problem connecting to mongodb ${error.message}`)
        process.exit(1)
    }
}

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
    connectDB()
})

const generateTokenAndSetCookies = (userId, res) =>{
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '15d'})

    res.cookie('jwt', token, {
        maxAge: 15*24*60*60*1000,
        httponly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV !== 'development'
    })
}

const protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookie.jwt
        if(!token) {
            return res.status(401).json({error: "Unauthorized: No token provided"})
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if(!decoded) {
            res.status(401).json({error: 'Unauthorized: No valid token'})
        }
        const user = await User.findById(decoded.userId).select('-password')
        if(!user) {
            res.status(404).json({error: "User not found"})
        }

        req.user = user
        next()
        
    } catch (error) {
       console.log(`Error in protectRoute controller ${error.message}`) 
       res.status(500).json({error: 'Internal server error'})
    }
}

const loginUser = async (req, res, next) => {
    const { username, password } = req.body
    const user = await User.findOne({username})
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || '')

    if(!user || !isPasswordCorrect) {
        res.status(400).json({error: "Invalid username or password"})
    }

    generateTokenAndSetCookies(user._id, res)
    res.status(200).json({
        _id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        followers: user.followers,
        profileImg: user.profileImg,
        coverImg: user.coverImg
    })

}

const logoutUser = (req, res, next) => {
    try {
        res.cookie('jwt', '', {maxAge: 0})
        res.status(500).json({msg: "successfully logged out"})
        
    } catch (error) {
        console.log(`Error in logout controller ${error.message}`)
        res.status(500).json({error: "Internal Server error"})
    }
}
