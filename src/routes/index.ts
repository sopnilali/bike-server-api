import { Router } from 'express';
import customerRoutes from '../modules/customers/customer.routes';
import bikeRoutes from '../modules/bikes/bike.routes';
import serviceRoutes from '../modules/services/service.routes';
import authRoutes from '../modules/auth/auth.routes';
import filesRoutes from '../modules/files/files.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/files', filesRoutes);
router.use('/customers', customerRoutes);
router.use('/bikes', bikeRoutes);
router.use('/services', serviceRoutes);

export default router;
