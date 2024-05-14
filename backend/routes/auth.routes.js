import express from 'express'
import { getMe, login, logout, signup } from '../controllers/auth.controllers.js'
import { protectRoute } from '../middleware/protectRoute.js'

const router = express.Router()


router.get('/me', protectRoute,  getMe)
router.post('/logout',logout)
router.post('/login', login)
router.post('/signup', signup)

export default router

