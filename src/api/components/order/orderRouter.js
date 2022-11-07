import "express";

const router = express.Router();

router.post("/createOrder", (req, res) => {
  res.send("createorder");
});

router.put("/updateOrder", (req, res) => {
  res.send("updateOrder");
});

router.delete("/deleteOrder", (req, res) => {
  res.send("delete");
});

router.post("/getOrder", (req, res) => {
  res.send("getOrder");
});
router.post("/getOrdersByNftId", (req, res) => {
  res.send("getOrdersByNftId");
});
