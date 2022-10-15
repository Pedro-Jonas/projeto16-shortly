import express from 'express';
import * as userController from '../Controllers/users.Controller.js';
import autorizationMiddleware from '../Middlewares/authorization.Middleware.js';

const router = express.Router();

router.use(autorizationMiddleware);

router.get('/users/me', userController.getUser);

export default router;