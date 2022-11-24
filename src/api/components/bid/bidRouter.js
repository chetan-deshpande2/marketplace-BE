import express from "express";
import {
  createBidNft,
  updateBid,
  fetchBidNft,
  acceptBidNft,
} from "./bidController";
import bidMiddleware from "../../middleware/middleware";

const router = express.Router();

router.post("/createBid", createBidNft);
router.post("/updateBid", updateBid);
router.post("/fetchBidNft", fetchBidNft);
router.post("/acceptBidNft", acceptBidNft);

module.exports = router;
