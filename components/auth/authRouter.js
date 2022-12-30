import express from 'express';
import { register, login, checkUserAddress, Logout } from './authController.js';
import {
  verifyToken,
  verifyWithoutToken,
  proceedWithoutToken,
} from '../../middleware/middleware.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', verifyToken, Logout);
router.post('/checkuseraddress', checkUserAddress);

export default router;
