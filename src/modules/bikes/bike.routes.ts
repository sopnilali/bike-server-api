import { Router } from 'express';
import * as bikeController from './bike.controller';
import authenticate from '../../middlewares/auth';

const router = Router();

router.post('/', authenticate, bikeController.createBike);
router.get('/', authenticate, bikeController.getAllBikes);
router.get('/:id', authenticate, bikeController.getBikeById);

export default router;
