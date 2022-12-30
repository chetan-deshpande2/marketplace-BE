import express from 'express';
import {
  createBidNft,
  updateBid,
  fetchBidNft,
  acceptBidNft,
} from './bidController.js';
import {
  verifyToken,
  verifyWithoutToken,
  proceedWithoutToken,
} from '../../middleware/middleware.js';

const router = express.Router();

router.post('/createBidNft', verifyToken, createBidNft);
router.post('/updateBid', updateBid);
router.post('/fetchBidNft', verifyToken, fetchBidNft);
router.post('/acceptBidNft', acceptBidNft);

export default router;
