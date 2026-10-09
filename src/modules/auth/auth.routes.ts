import { Router } from 'express';
import * as authController from './auth.controller';
import authenticate from '../../middlewares/auth';
import { photoUpload } from '../../utils/upload';

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/me', authenticate, authController.getProfile);
router.put('/me', authenticate, authController.updateProfile);
router.put('/me/photo', authenticate, photoUpload.single('photo'), authController.uploadProfilePhoto);
router.delete('/me/photo', authenticate, authController.removeProfilePhoto);
router.post('/change-password', authenticate, authController.changePassword);

export default router;
