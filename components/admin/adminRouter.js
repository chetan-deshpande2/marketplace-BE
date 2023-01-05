import express from 'express';

import {
  users,
  getDashboardData,
  toggleUserStatus,
  nftData,
} from './adminController.js';
import {
  verifyToken,
  verifyWithoutToken,
  proceedWithoutToken,
} from '../../middleware/middleware.js';

const router = express.Router();
router.post('/user', users);
router.get('/getDashobordData', verifyToken, getDashboardData);
router.post('/toggleUserStatus', verifyToken, toggleUserStatus);
router.post('/nftData', verifyToken, nftData);

export default router;
