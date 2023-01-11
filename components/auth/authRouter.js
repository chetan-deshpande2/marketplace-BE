import express from 'express';
import {
  register,
  login,
  checkUserAddress,
  Logout,
  adminRegister,
  adminLogin,
} from './authController.js';
import { verifyToken } from '../../middleware/middleware.js';
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', verifyToken, Logout);
router.post('/checkuseraddress', checkUserAddress);
router.post('/adminRegister', adminRegister);
router.post('/adminLogin', adminLogin);

export default router;
