import express from "express";

const router = express.Router();

router.post("/insert", (req, res) => {
  res.send("Insert History");
});
router.get("/fetchHistory", (req, res) => {
  res.send("getHistory");
});

module.exports = router;
