import express from 'express'
import { login } from '../controllers/login.js'
import { logout } from '../controllers/logout.js'
import { signup } from '../controllers/signup.js'
const router = express.Router()

router.post('/logout',logout)
router.post('/login', login)
router.post('/signup', signup)

export default router

