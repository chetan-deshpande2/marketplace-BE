import express from "express";
import { insertHistory, fetchHistory } from "./historyController";
import historyMiddleware from "../../middleware/middleware";

const router = express.Router();

router.post("/insert", historyMiddleware.verifyToken, insertHistory);
router.get("/fetchHistory", historyMiddleware.verifyWithoutToken, fetchHistory);

module.exports = router;
