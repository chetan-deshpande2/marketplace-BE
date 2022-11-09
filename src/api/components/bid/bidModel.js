import mongoose from "mongoose";
import db from "../../connections/db";

const bidSchema = new mongoose.Schema({
  oBidder: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  oOwner: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  oBidStatus: {
    type: String,
    enum: ["Bid", "Cancelled", "Accepted", "Sold", "Rejected"],
  },
  oBidPrice: {
    type: mongoose.Types.Decimal128,
    required: true,
  },
  oNFTId: {
    type: mongoose.Schema.ObjectId,
    ref: "NFT",
  },
  oOrderId: {
    type: mongoose.Schema.ObjectId,
    ref: "Order",
  },
  sCreated: {
    type: Date,
    default: Date.now,
  },
  oBidDeadline: Number,
  oBidQuantity: Number,
  oBuyerSignature: Array,
});

export default db.model("Bid", bidSchema);
