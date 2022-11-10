import mongoose from "mongoose";
import db from "../../connections/db";

const nftOwnerSchema = mongoose.Schema({
  nftId: {
    type: mongoose.Schema.ObjectId,
    ref: "Nft",
  },
  sCreated: {
    type: Date,
    default: Date.now,
  },
  oCurrentOwner: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  sOrder: Array,
  sSignature: Array,
  nQuantity: Number,
  nQuantityLeft: Number,
  nBasePrice: mongoose.Types.Decimal128,
  eAuctionType: {
    type: String,
    enum: ["Auction", "Fixed Sale", "Unlockable"],
  },
  sTransactionStatus: {
    type: Number,
    default: -99,
    // -99: Transaction not submitted to Blockchain
    // -1:  Transaction Failed
    //  0:  Pending
    //  1:  Mined
    enum: [-99, -1, 0, 1],
  },
  auction_end_date: { type: Date },
});

export default db.model("NFTowners", nftOwnerSchema);
