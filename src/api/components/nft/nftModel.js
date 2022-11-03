const mongoose = require("mongoose");

const collectionSchema = mongoose.Schema({
  sHash: {
    type: String,
    require: true,
    unique: false,
  },
  collectionImage: { type: String, require: true },
  sContractAddress: {
    type: String,
    unique: true,
    require: true,
    lowercase: true,
  },
  erc721: {
    type: Boolean,
    require: true,
    default: true,
  },
  nextId: {
    type: Number,
    require: true,
    default: 0,
  },
  sCreated: {
    type: Date,
    default: Date.now,
  },
  oCreatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  sRoyaltyPercentage: Number,
  sName: String,
  sDescription: String,
});

collectionSchema.methods.getNextId = function () {
  let nextIddd = this.nextId + 1;
  return nextIddd;
};

module.exports = mongoose.model("Collection", collectionSchema);