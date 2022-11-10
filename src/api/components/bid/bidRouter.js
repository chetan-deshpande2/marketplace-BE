import express from "express";
import {
  createBidNft,
  updateBid,
  fetchBidNft,
  acceptBidNft,
} from "./bidController";

const router = express.Router();

router.post("/createBid", createBidNft);
router.post("/updateBid", updateBid);
router.post("/fetchBid", fetchBidNft);
router.post("/acceptBidNft", acceptBidNft);

module.exports = router;
