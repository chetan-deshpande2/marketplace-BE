import express from "express";

const router = express.Router();

router.post("/create", (req, res) => {
  res.send("create Route");
});

module.exports = router;
