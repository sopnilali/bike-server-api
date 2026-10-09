import { Router } from 'express';
import { getProfilePhoto } from './files.controller';

const router = Router();

// Public: stream a customer's profile photo (private S3 bucket proxied via API).
router.get('/profile/:id', getProfilePhoto);

export default router;
