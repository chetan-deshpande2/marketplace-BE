import express from 'express';

import {
  createOrder,
  updateOrder,
  deleteOrder,
  getOrder,
  getOrdersByNftId,
} from './orderController.js';
import {
  verifyToken,
  verifyWithoutToken,
  proceedWithoutToken,
} from '../../middleware/middleware.js';

const router = express.Router();

router.post('/createOrder', verifyToken, createOrder);

router.put('/updateOrder', verifyToken, updateOrder);

router.delete('/deleteOrder', verifyToken, deleteOrder);

router.post('/getOrder', getOrder);
router.post('/getOrdersByNftId', getOrdersByNftId);

export default router;
