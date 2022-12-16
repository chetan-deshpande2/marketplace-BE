import express from "express";
import {
  createBidNft,
  updateBid,
  fetchBidNft,
  acceptBidNft,
} from "./bidController";
import bidMiddleware from "../../middleware/middleware";

const router = express.Router();

router.post("/createBidNft", bidMiddleware.verifyToken, createBidNft);
router.post("/updateBid", updateBid);
router.post("/fetchBidNft", bidMiddleware.verifyToken, fetchBidNft);
router.post("/acceptBidNft", acceptBidNft);

module.exports = router;
