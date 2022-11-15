import express from "express";
import { register, login, checkUserAddress } from "./authController";
import NFTmiddleware from "../../middleware/middleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", NFTmiddleware.proceedWithoutToken, (req, res) => {
  res.send("Logout");
});
router.post("/checkuseraddress", checkUserAddress);

export default router;
