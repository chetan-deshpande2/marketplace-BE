import mongoose from "mongoose";

import Bid from "./bidModel";
import User from "../user/userModel";
import NFT from "../nft/nftModel";
import Order from "../order/orderModel";

module.exports = {
  createBidNft: async (req, res) => {
    console.log(req.body);
    try {
      if (!req.userId) return res.send("Unauthorized user");
      console.log("Checking Old Bids");
      let checkBid = await Bid.findOne({
        oBidder: mongoose.Types.ObjectId(req.userId),
        oOwner: mongoose.Types.ObjectId(req.body.oOwner),
        oNFTId: mongoose.Types.ObjectId(req.body.oNFTId),
        oOrderId: mongoose.Types.ObjectId(req.body.oOrderId),
        oBidStatus: "Bid",
      });
      if (checkBid) {
        await Bid.findOneAndDelete(
          {
            oBidder: mongoose.Types.ObjectId(req.userId),
            oOwner: mongoose.Types.ObjectId(req.body.oOwner),
            oNFTId: mongoose.Types.ObjectId(req.body.oNFTId),
            oOrderId: mongoose.Types.ObjectId(req.body.oOrderId),
            oBidStatus: "Bid",
          },
          function (err, bidDel) {
            if (err) {
              console.log("Error in deleting Old Bid" + err);
            } else {
              console.log("Old Bid record Deleted" + bidDel);
            }
          }
        );
      }
      const bidData = new Bid({
        oBidder: req.userId,
        oOwner: req.body.oOwner,
        oBidStatus: "Bid",
        oBidPrice: req.body.oBidPrice,
        oNFTId: req.body.oNFTId,
        oOrderId: req.body.oOrderId,
        oBidQuantity: req.body.oBidQuantity,
        oBuyerSignature: req.body.oBuyerSignature,
        oBidDeadline: req.body.oBidDeadline,
      });
      bidData
        .save()
        .then(async (result) => {
          return res.send("Bid Placed", result);
        })
        .catch((error) => {
          console.log("Created Bid error", error);
          return res.send("Created Bid Error");
        });
    } catch (error) {
      res.send(error);
    }
  },
  updateBid: async (req, res) => {
    try {
      console.log("Checking Old Bids");
      let bidID = req.body.bidID;
      let CheckBid = await Bid.findById(bidID);
      if (CheckBid) {
        if (req.body.action == "Delete" || req.body.action == "Cancelled") {
          await Bid.findOneAndDelete(
            { _id: mongoose.Types.ObjectId(bidID) },
            function (err, delBid) {
              if (err) {
                console.log("Error in Deleting Bid" + err);
                return res.send(err);
              } else {
                console.log("Bid Deleted : ", delBid);
                return res.send("Bid Cancelled", delBid);
              }
            }
          );
        } else {
          await Bid.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(bidID) },
            { oBidStatus: req.body.action },
            function (err, rejBid) {
              if (err) {
                console.log("Error in Rejecting Bid" + err);
                return res.reply(messages.error());
              } else {
                console.log("Bid Rejected : ", rejBid);
                return res.reply(messages.created("Bid Rejected"), rejBid);
              }
            }
          );
        }
      } else {
        res.send("Bid Not Found");
      }
    } catch (error) {
      res.send(error);
    }
  },
  fetchBidNft: async (req, res) => {
    console.log(req.body);
    try {
      
    } catch (error) {
      console.log(error)
      
    }
  },
  acceptBidNft: async (req, res) => {},
};
