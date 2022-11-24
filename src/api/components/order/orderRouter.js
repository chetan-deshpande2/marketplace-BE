import express from "express";

import {
  createOrder,
  updateOrder,
  deleteOrder,
  getOrder,
  getOrdersByNftId,
} from "./orderController";
import OrderMiddleware from "../../middleware/middleware";

const router = express.Router();

router.post("/createOrder", OrderMiddleware.verifyToken, createOrder);

router.put("/updateOrder", OrderMiddleware.verifyToken, updateOrder);

router.delete("/deleteOrder", OrderMiddleware.verifyToken, deleteOrder);

router.post("/getOrder", getOrder);
router.post("/getOrdersByNftId", getOrdersByNftId);

module.exports = router;
