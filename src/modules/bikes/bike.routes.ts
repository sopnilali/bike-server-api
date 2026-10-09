import { Router } from 'express';
import * as bikeController from './bike.controller';

const router = Router();

router.post('/', bikeController.createBike);
router.get('/', bikeController.getAllBikes);
router.get('/:id', bikeController.getBikeById);

export default router;
