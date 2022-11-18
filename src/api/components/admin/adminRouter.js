import express from "express";
import { users } from "./adminController";
import adminMiddleware from "../../middleware/middleware";

const router = express.Router();
router.post("/user", users);

module.exports = router;
