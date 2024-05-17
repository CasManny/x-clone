import mongoose, { mongo } from "mongoose";
import User from "./models/userModel.js";
import { v2 as cloudinary } from 'cloudinary'

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,

    },
    img: {
        type: String,
    },
    likes: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    }],
    comments: [{
        text: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    }]
}, { timestamps: true})

const Post = mongoose.model("Post", postSchema)


// create post
const createPost = async (req, res) => {
    try {
        const { text } = req.body
        let { img } = req.body
        const userId = req.user._id
        const user = await User.findById(userId)

        if(!user) return res.status(404).json({error: "User not found"})
        if(!text && !img) return res.status(400).json({error: "Post must have text or image"})

        if(img) {
            const uploadResponse = await cloudinary.uploader.upload(img)
            img = uploadResponse.secure_url()
        }

        const newPost = new Post({
            user: userId,
            text,
            img
        })

        await newPost.save()

        res.status(201).json(newPost)


    } catch (error) {
        console.log(`Error in practice controller: ${error.message}`)
        res.status(500).json({error: "Internal Server Error"})
    }
}

const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if(!post) return res.status(404).json({error: "Post not found"})

        if(post.user !== req.user._id) return res.status(401).json({error: "Unauthorized action"})

        if(img) {
            const imgId = post.img.split("/").pop().split(".")[0]
            await cloudinary.uploader.destroy(imgId)
        }
        await Post.findByIdAndDelete(req.params.id)
        res.status(200).json({message: "Post successfully deleted"})
    } catch (error) {
     console.log(`Error in practice controller: ${error.message}`)   
     res.status(500).json({error: "Internal Server Error"})
    }
}


const commentonpost = async (req, res) => {
    try {
        const postId = req.params.id
        const userId = req.user._id
        const { text } = req.body

        const post = await Post.findById(postId)
        if(!post) return res.status(404).json({error: "Post not found"})
        if(!text) return res.status(400).json({error: "Text field must be filled"})

        const comment = { user: userId, text: text}
        post.comments.push(comment)
        await post.save()

        res.status(200).json(post)
    } catch (error) {
        console.log(`Error in practice controller: ${error.message}`)
        res.status(500).json({error: "Internal Server Error"})
    }
}


const likeUnlikePOst = async (req, res) => {
    try {
        const postId = req.params.id
        const userId = req.user._id
        const post = await Post.findById(postId)

        if(!post) return res.status(404).json({error: "post not found"})

        const userLikedPost = post.likes.includes(userId)

        if(userLikedPost) {
            // unlike post
            await Post.updateOne({_id: postId}, { $pull: { likes: userId}})
            await User.updateOne({_id: userId}, { $pull: { likedPosts: postId}})
            res.status(200).json({message: "Post successfully unliked"})
        } else {
            // like post
            post.likes.push(userId)
            await User.updateOne({_id: userId}, {$push: { likedPosts: postId}})

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            })

            await notification.save()
            await post.save()

            res.status(200).json({messge: "post successfully liked"})
        }
        
    } catch (error) {
        console.log(`Error in likeunlikepost controller: ${error.message}`)
        res.status(500).json({error: "Internal server error"})
    }
}

const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({createdAt: -1}).populate({
            path: "user",
            select: "-password"
        }).populate({
            path:"comments.user",
            select: "-password"
        })

        if(posts.length === 0) return res.status(200).json([])
        res.status(200).json(posts)
    } catch (error) {
       console.log(`Error in getallposts controller: ${error.message}`) 
       res.status(500).json({error: "Internal Server Error"})
    }
}

const getLikedPosts = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId)

        if(!user) return res.status(404).json({ error: "User not found"})

        const likedPosts = await Post.findById({_id: {$in: user.likedPosts}}).populate({
            path: "comments.user",
            select: "-password"
        })
        
    } catch (error) {
        console.log(`Error in getlikedpost controller: ${error.message}`)
        res.status(500).json({error: "Internal Server Error"})
    }
}

const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId)
        if(!user) return res.status(404).json({error: "user not found"})
        // The array of "id" of users that our current user is following
        const following = user.following

        const feedPosts = await Post.findById({user: { $in: following}}).sort({createdAt: -1}).populate({
            path: "comments.user",
            select: "-password"
        })

        res.status(200).json(feedPosts)
    } catch (error) {
       console.log(`Error in getfollowingposts controller: ${error.message}`) 
       res.status(500).json({ error: "Internal Server Error"})
    }
}
