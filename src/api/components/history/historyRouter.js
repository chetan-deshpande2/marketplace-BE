import express from "express";
import { insertHistory, fetchHistory } from "./historyController";

const router = express.Router();

router.post("/insert", insertHistory);
router.get("/fetchHistory", fetchHistory);

module.exports = router;
