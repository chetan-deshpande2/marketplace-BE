import fs from "fs";
import ipfsAPI from "ipfs-api";
import mongoose from "mongoose";
import multer from "multer";
import pinataSDK from "@pinata/sdk";
import jwt from "jsonwebtoken";

import Order from "./orderModel";
import NFT from "../nft/nftModel";

const ipfs = ipfsAPI("ipfs.infura.io", "5001", {
  protocol: "https",
  auth: "21w11zfV67PHKlkAEYAZWoj2tsg:f2b73c626c9f1df9f698828420fa8439",
});

const pinata = new pinataSDK({
  pinataApiKey: "3ea7991864f4a7d2f998",
  pinataSecretApiKey:
    "5988caf8173c5cc986978b9bfd48060622830025ce80cc167f3c58d56ae29dbf",
});

module.exports = {
  createOrder: async (req, res) => {
    try {
      console.log(req.body);
      let orderDate = new Date().setFullYear(new Date().getFullYear() + 10);
      let validity = Math.floor(orderDate / 1000);
      const order = new Order({
        oNftId: req.body.nftId,
        oSellerWalletAddress: req.body.seller,
        oTokenId: req.body.tokenId,
        oTokenAddress: req.body.collection,
        oQuantity: req.body.quantity,
        oType: req.body.saleType,
        oPaymentToken: req.body.tokenAddress,
        oPrice: req.body.price,
        oSalt: req.body.salt,
        oSignature: req.body.signature,
        oValidUpto: req.body.validUpto,
        oBundleTokens: [],
        oBundleTokensQuantities: [],
        oStatus: 1,
        oSeller: req.userId,
        oStatus: req.body.status,
        auction_end_date: req.body.auctionEndDate,
      });
      const result = order.save();
      res.status(300).send("Order Created", result);
    } catch (error) {
      console.log("Error " + JSON.stringify(error));
      res.send(error);
    }
  },
  deleteOrder: async (req, res) => {
    try {
      if (!req.userId) return console.log("Unauthorized");
      await Order.find({ _id: req.body.orderId }).remove().exec();
      await Bid.find({ oOrderId: req.body.orderId, oBidStatus: "Bid" })
        .remove()
        .exec();

      return res.send("Order Deleted Sucessfully");
    } catch (error) {
      res.send(error);
    }
  },
  updateOrder: async (req, res) => {},
  getOrder: async (req, res) => {
    try {
      Order.findOne({ _id: req.body.orderId }, (err, order) => {
        if (err) return res.send("Server Error");
        if (!order) return res.send("Order Not Found");
        return res.send("Order Details", order);
      });
    } catch (error) {
      res.status(401).send(error);
    }
  },
};
