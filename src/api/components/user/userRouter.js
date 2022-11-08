import express from "express";
import { profile, updateProfile } from "./userController";

const router = express.Router();

router.get("/profile", profile);
router.post("/updateProfile", updateProfile);

module.exports = router;
