import express from 'express';

import {
  createBidNft,
  updateBidNft,
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
router.post('/updateBidNft', updateBidNft);
router.post('/fetchBidNft', verifyToken, fetchBidNft);
router.post('/acceptBidNft', verifyToken, acceptBidNft);

export default router;
