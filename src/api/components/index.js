import express from "express";

const router = express.Router();

import nftRouter from "./nft/nftRouter";
import collectionRouter from "./collection/collectionRouter";
import bidRouter from "./bid/bidRouter";
import orderRouter from "./order/orderRouter";
import historyRouter from "./history/historyRouter";
import userRouter from "./user/userRouter";

router.use("/nft", nftRouter);
router.use("/collection", collectionRouter);
router.use("/bid", bidRouter);
// router.use("/order", orderRouter);
router.use("/history", historyRouter);
router.use("/user", userRouter);

module.exports = router;
