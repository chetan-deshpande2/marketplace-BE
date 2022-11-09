import express from "express";
import { users } from "./adminController";

const router = express.Router();
router.post("/user", users);

export default router;
