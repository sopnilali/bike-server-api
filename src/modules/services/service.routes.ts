import { Router } from 'express';
import * as serviceController from './service.controller';

const router = Router();

// IMPORTANT: /status must come before /:id, otherwise "status" is treated as an ID.
router.get('/status', serviceController.getOverdueServices);
router.post('/', serviceController.createService);
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.put('/:id/complete', serviceController.completeService);

export default router;
