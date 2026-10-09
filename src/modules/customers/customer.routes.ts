import { Router } from 'express';
import * as customerController from './customer.controller';
import authenticate, { authorize } from '../../middlewares/auth';

const router = Router();

// Staff + admin can list/create. Admin can delete.
// Get/update allowed for self or staff/admin (enforced in controller).
router.post('/', authenticate, authorize('staff', 'admin'), customerController.createCustomer);
router.get('/', authenticate, authorize('staff', 'admin'), customerController.getAllCustomers);
router.get('/:id', authenticate, customerController.getCustomerById);
router.put('/:id', authenticate, customerController.updateCustomer);
router.delete('/:id', authenticate, authorize('admin'), customerController.deleteCustomer);

export default router;
