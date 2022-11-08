import express from "express";
import { multerCheck } from "./bidController";

const router = express.Router();

router.post("/bidNFT", multerCheck);

module.exports = router;
