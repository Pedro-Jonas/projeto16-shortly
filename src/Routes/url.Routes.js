import express from 'express';
import * as urlController from '../Controllers/url.Contoller.js';
import autorizationMiddleware from '../Middlewares/authorization.Middleware.js';

const router = express.Router();


router.use(autorizationMiddleware);

router.post('/urls/shorten', urlController.postUrlShoten);

export default router;