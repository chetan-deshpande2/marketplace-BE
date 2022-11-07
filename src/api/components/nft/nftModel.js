const mongoose = require("mongoose");
import db from "../../connections/db";

const nftSchema = mongoose.Schema({
  nHash: {
    type: String,
    require: true,
  },
  nCreated: {
    type: Date,
    default: Date.now,
  },
  nCreater: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    require: true,
  },
  nOrders: [{ type: mongoose.Schema.ObjectId, ref: "Order" }],
  nCollection: String,
  nTitle: String,
  nCollaborator: Array,
  nDescription: String,
  nCollaboratorPercentage: Array,
  nRoyaltyPercentage: Number,
  nQuantity: Number,
  nView: Number,
  nNftImage: { type: String, require: true },
  nType: {
    type: Number,
    require: true,
    //1 - ERC721
    //2 - ERC1155
    enum: [1, 2],
  },
  nTokenID: {
    type: Number,
    require: true,
  },
  nUser_likes: [
    {
      type: mongoose.Schema.ObjectId,
    },
  ],
  nOwnedBy: [
    {
      address: {
        type: String,
        lowercase: true,
      },
      quantity: {
        type: Number,
      },
    },
  ],
  nLockedContent: {
    type: String,
  },
  nLazyMintingStatus: {
    type: Number,
    default: 0,

    //  0: Not lazy minting
    //  1: lazy minting
    //  2: isMinted
    enum: [0, 1, 2],
  },
});

export default db.model("NFT", nftSchema);
