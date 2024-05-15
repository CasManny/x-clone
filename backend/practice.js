import User from "./models/userModel.js"
import jwt from 'jsonwebtoken'
import mongoose, { mongo } from "mongoose"
import bcrypt from 'bcryptjs'

const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params
        const user = await User.findOne({username}).select("-password")
        if(!user) {
            return res.status(404).json({error: "User not found"})
        }
        res.status(200).json(user)
    } catch (error) {
        console.log(`Error in practice js: ${error.message}`)
        res.status(500).json({error: "Internal Server Error"})
    }
}

const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params
        const userToModify = await User.findById({id})
        const currentUser = await User.findById(req.user._id)

        if(id === req.user._id) {
            return res.status(401).json({error: "You cannot follow or unfollow yourself"})
        }

        if(!currentUser || !userToModify) {
            return res.status(404).json({error: "user not found"})
        }

        const isFollowing = currentUser.following.includes(id)

        if(isFollowing) {
            // unfollow user
            await User.findByIdAndUpdate(id, {$pull: { followers: req.user._id}})
            await User.findByIdAndUpdate(req.user._id, {$pull: {following: id}})
        } else {
            // follow user
            await User.findByIdAndUpdate(id, {$push: { followers: req.user._id}})
            await User.findByIdAndUpdate(req.user._id, {$push: {following: id}})
        }
        
    } catch (error) {
        console.log(`Error in practice js controller: ${error.message}`)
        res.status(500).json({error: "Internal Server Error"})
    }
}

const protectedroute = async (req, res, next) => {
    try {
        const token = req.cookie.jwt
        if(!token) {
            return res.status(404).json({error: "Unauthorized: No token found"})
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        if(!decode) {
            return res.status(404).json({error: "Unauthorized: No token found"})
        }
        const user = await User.findById(decode.userId).select("-password")
        if(!user) {
            return res.status(404).json({error: "No user found"})
        }
        
        req.user = user
        next()
    } catch (error) {
        console.log(`Error in protectedroute controller: ${error.message}`)
        res.status(500).json({error: "Internal Server error"})

    }
}

const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id
        const usersFollowedByMe = await User.findById(userId).select('following')

        const usersInDB = await User.aggregate([
            {
                $match: {
                    $ne: userId
                }
            },
            {
                $sample: {
                    size: 10
                }
            }
        ])

        const filteredUsers = usersInDB.filter((user) => !usersFollowedByMe.following.includes(user._id))

        const suggestedUsers = filteredUsers.slice(0, 4)
        suggestedUsers.forEach((user) => user.password = null)
        res.status(200).json(suggestedUsers)
        
    } catch (error) {
        console.log(`Error in practice controller: ${error.message}`)
        res.status(500).json({error: "Internal Server Error"})
    }
}

const encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
}