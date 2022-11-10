import express from "express";

import {
  createOrder,
  updateOrder,
  deleteOrder,
  getOrder,
  getOrdersByNftId,
} from "./orderController";

const router = express.Router();

router.post("/createOrder", createOrder);

router.put("/updateOrder", updateOrder);

router.delete("/deleteOrder", deleteOrder);

router.post("/getOrder", getOrder);
router.post("/getOrdersByNftId", getOrdersByNftId);

module.exports = router;
