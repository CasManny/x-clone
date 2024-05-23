import Notification from "../models/notification.model.js"
import Post from "../models/post.model.js"
import User from "../models/userModel.js"
import {v2 as cloudinary } from 'cloudinary'

export const createPost = async (req, res) => {
    try {
        const { text } = req.body
        let { img } = req.body

        const userId = req.user._id

        const user = await User.findById(userId)
        if(!user) return res.status(404).json({error: "User not found"})
        if(!text && !img) return res.status(400).json({error: "Post must have text or image"})

        if(img) {
            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url
        }

        const newPost = new Post({
            user: userId,
            text, 
            img
        })
        await newPost.save()
        res.status(201).json(newPost)
    } catch (error) {
        console.log(`Error in post controller: ${error.message}`)
        res.status(500).json({error: error.message})
    }
}

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if(!post) return res.status(404).json({error: "Post not found"})
        if(post.user.toString() !== req.user._id.toString()) return res.status(401).json({error: "You are not authorized to delete this post"})

        if(post.img) {
            const imgId = post.img.split('/').pop().split('.')[0]
            await cloudinary.uploader.destroy(imgId)
        }
        await Post.findByIdAndDelete(req.params.id)
        res.status(200).json({message: "Post deleted Successfully"})
    } catch (error) {
       console.log(`Error in deletepost controller: ${error.message}`)
       res.status(500).json({error: "Internal Server Error"}) 
    }
}

export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body
        const postId = req.params.id
        const userId = req.user._id

        if(!text) return res.status(400).json({error: "Text Field is required"})

        const post = await Post.findById(postId)
        if(!post) return res.status(404).json({error: "Post not found"})

        const comment = { user: userId, text: text}
        post.comments.push(comment)
        await post.save()
        
        res.status(200).json(post)
    } catch (error) {
        console.log(`Error in commentonpost controller: ${error.message}`)
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id
        const postId = req.params.id
        const post = await Post.findById(postId)
        if(!post) return res.status(404).json({error: "Post not found"})

        const userLikedPost = post.likes.includes(userId)

        if(userLikedPost) {
            // unlike the post
            await Post.updateOne({ _id: postId}, { $pull: { likes: userId }})
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } })
            
            const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString())
            res.status(200).json(updatedLikes)
        } else {
            // like the post
            post.likes.push(userId)
            await User.updateOne({_id: userId}, {$push: { likedPosts: postId}})
            await post.save()

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: 'like'
            })
            
            await notification.save()
            const updatedLikes = post.likes
            res.status(200).json(updatedLikes)
        }
    } catch (error) {
        console.log(`Error in likeUnlikePOst controller: ${error.message}`)
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: '-password'
        })
        if(posts.length === 0) return res.status(200).json([])
        res.status(200).json(posts)
    } catch (error) {
        console.log(`Error in getallPosts controller: ${error.message}`)
        res.status(500).json({error: "Internal server error"})
    }
}

export const getLikedPosts = async (req, res) => {
    try {
        const userId = req.params.id
        const user = await User.findById(userId)
        if(!user) return res.status(404).json({error: "User not found"})

        const likedposts = await Post.find({_id: {$in: user.likedPosts}}).populate({
            path: "comments.user",
            select: "-password"

        })
        if(likedposts.length === 0) return res.status(200).json([])

        res.status(200).json(likedposts)
        
    } catch (error) {
        console.log(`Error in getlikedposts controller: ${error.message}`)
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId)

        if(!user) return res.status(404).json({error: "User not found"})

        const following = user.following
        // get the posts created by those the current user is following
        const feedPosts = await Post.find({user: { $in: following}}).sort({ createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })
        res.status(200).json(feedPosts)
    } catch (error) {
        console.log(`Error in getfollowingposts controller: ${error.message}`)
        res.status(500).json({error: "Internal Server Error"})
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const username = req.params.username
        const user = await User.findOne({username})
        if(!user) return res.status(404).json({ error: "User not found"})

        const posts = await Post.find({user: user._id}).sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json(posts)
    } catch (error) {
        console.log(`Error in getUserpost controller: ${error.message}`)
    }
}