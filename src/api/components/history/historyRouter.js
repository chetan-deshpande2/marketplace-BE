import express from "express";
import { insertHistory, fetchHistory } from "./historyController";
import historyMiddleware from "../../middleware/middleware";

const router = express.Router();

router.post("/insert", insertHistory);
router.get("/fetchHistory", fetchHistory);

module.exports = router;
