import express from "express";
import { create } from "./nftController";

const router = express.Router();

router.post("/create", create);

module.exports = router;
