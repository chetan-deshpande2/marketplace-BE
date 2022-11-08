import express from "express";
import { create, setNFTOrder } from "./nftController";

const router = express.Router();

router.post("/create", create);
router.post("/setNFTOrder");

module.exports = router;
