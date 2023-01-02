import express from 'express';

import nftRouter from './nft/nftRouter.js';
import collectionRouter from './collection/collectionRouter.js';
import bidRouter from './bid/bidRouter.js';
import orderRouter from './order/orderRouter.js';
import historyRouter from './history/historyRouter.js';
import userRouter from './user/userRouter.js';
import adminRouter from './admin/adminRouter.js';
import authRouter from './auth/authRouter.js';

const router = express.Router();

router.use('/nft', nftRouter);
router.use('/collection', collectionRouter);
router.use('/bid', bidRouter);
router.use('/order', orderRouter);
router.use('/history', historyRouter);
router.use('/user', userRouter);
router.use('/admin', adminRouter);
router.use('/auth', authRouter);

export default router;
