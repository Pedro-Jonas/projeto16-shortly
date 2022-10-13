import express from 'express';
import * as authController from '../Controllers/auth.Controller.js';

const router = express.Router();

router.post("/signup", authController.postSignup);

export default router;