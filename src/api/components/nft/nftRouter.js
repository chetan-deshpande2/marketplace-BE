import express from "express";
import { create, setNFTOrder } from "./nftController";
import NFTmiddleware from "../../middleware/middleware";

const router = express.Router();

router.post("/create", NFTmiddleware.verifyWithoutToken, create);
router.post("/setNFTOrder");

module.exports = router;
