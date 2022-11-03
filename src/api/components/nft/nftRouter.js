import express from "express";

const router = express.Router();

import { createCollection, testPinata } from "./nftController";

router.post("/createCollection", createCollection);
router.get("/testPinata", testPinata);

module.exports = router;
