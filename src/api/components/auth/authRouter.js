import express from "express";
import { register, login, checkUserAddress } from "./authController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout");
router.post("/checkuseraddress", checkUserAddress);

export default router;
