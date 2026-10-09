import { Router } from 'express';
import * as serviceController from './service.controller';
import authenticate, { authorize } from '../../middlewares/auth';

const router = Router();

// IMPORTANT: /status must come before /:id, otherwise "status" is treated as an ID.
router.get('/status', authenticate, authorize('staff', 'admin'), serviceController.getOverdueServices);
router.post('/', authenticate, authorize('staff', 'admin'), serviceController.createService);
router.get('/', authenticate, authorize('staff', 'admin'), serviceController.getAllServices);
router.get('/:id', authenticate, authorize('staff', 'admin'), serviceController.getServiceById);
router.put('/:id/complete', authenticate, authorize('staff', 'admin'), serviceController.completeService);

export default router;
