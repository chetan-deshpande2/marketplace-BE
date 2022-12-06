import express from "express";
import { insertHistory, fetchHistory } from "./historyController";
import historyMiddleware from "../../middleware/middleware";

const router = express.Router();

router.post("/insert", insertHistory);
router.post("/fetchHistory", fetchHistory);

module.exports = router;
