import express from "express";

const router = express.Router();

import nftRouter from "./nft/nftRouter";
import collectionRouter from "./collection/collectionRouter";

router.use("/nft", nftRouter);
router.use("/collection", collectionRouter);

module.exports = router;
