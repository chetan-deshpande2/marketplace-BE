import express from "express";

const router = express.Router();

import nftRouter from "./nft/nftRouter";

router.use("/nft", nftRouter);

module.exports = router;
