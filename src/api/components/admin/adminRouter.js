import express from 'express';
import { users } from './adminController.js';
import {
  verifyToken,
  verifyWithoutToken,
  proceedWithoutToken,
} from '../../middleware/middleware.js';

const router = express.Router();
router.post('/user', users);

export default router;
