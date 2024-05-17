import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js'
import { commentOnPost, createPost, deletePost, getAllPosts, getFollowingPosts, getLikedPosts, getUserPosts, likeUnlikePost } from '../controllers/posts.controllers.js'

const router = express.Router()

router.get('/allposts', protectRoute, getAllPosts)
router.post('/create', protectRoute, createPost)
router.delete('/:id', protectRoute, deletePost)
router.post('/like/:id', protectRoute, likeUnlikePost)
router.post('/likes/:id', protectRoute, getLikedPosts)
router.post('/comment/:id', protectRoute, commentOnPost)
router.post('/following', protectRoute, getFollowingPosts)
router.get('/user/:username', protectRoute, getUserPosts)


export default router