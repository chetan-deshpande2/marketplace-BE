import fs from "fs";
import ipfsAPI from "ipfs-api";
import mongoose from "mongoose";
import multer from "multer";
import pinataSDK from "@pinata/sdk";
import jwt from "jsonwebtoken";

import Order from "./orderModel";
import NFT from "../nft/nftModel";
import { result } from "lodash";

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
  updateOrder: async (req, res) => {
    try {
      console.log("req---->", req.body);
      let lazyMintingStatus = Number(req.body.LazyMintingStatus);
      if (lazyMintingStatus === 0) {
        lazyMintingStatus = 0;
      } else if (lazyMintingStatus === 1 || lazyMintingStatus === 2) {
        lazyMintingStatus = 2;
      }
      if (!req.userId) return res.send("unauthorized");
      if (!req.body.oNftId) return res.send("oNftId is required.");
      else
        await Order.updateOne(
          { _id: req.body.orderId },
          {
            $set: {
              oStatus: req.body.oStatus,
              quantity_sold: req.body.qty_sold,
            },
          },
          {
            upsert: true,
          },
          (err) => {
            if (err) throw error;
          }
        );

      //deduct previous owner
      let _NFT = await NFT.findOne({
        _id: mongoose.Types.ObjectId(req.body.oNftId),
        "nOwnedBy.address": req.body.oSeller,
      }).select("nOwnedBy -_id");

      console.log("_NFT-------->", _NFT);
      let currentQty = _NFT.nOwnedBy.find(
        (o) => o.address === req.body.oSeller.toLowerCase()
      ).quantity;
      let boughtQty = parseInt(req.body.oQtyBought);
      let leftQty = currentQty - boughtQty;
      if (leftQty < 1) {
        await NFT.findOneAndUpdate(
          { _id: mongoose.Types.ObjectId(req.body.oNftId) },
          {
            $pull: {
              nOwnedBy: { address: req.body.oSeller },
            },
          }
        ).catch((e) => {
          console.log("Error1", e.message);
        });
      } else {
        await NFT.findOneAndUpdate(
          {
            _id: mongoose.Types.ObjectId(req.body.oNftId),
            "nOwnedBy.address": req.body.oSeller,
          },
          {
            $set: {
              "nOwnedBy.$.quantity": parseInt(leftQty),
            },
          }
        ).catch((e) => {
          console.log("Error2", e.message);
        });
      }
      //Credit the buyer
      console.log("Crediting Buyer");

      let subDocId = await NFT.exists({
        _id: mongoose.Types.ObjectId(req.body.oNftId),
        "nOwnedBy.address": req.body.oBuyer,
      });
      if (subDocId) {
        console.log("Subdocument Id", subDocId);

        let _NFTB = await NFT.findOne({
          _id: mongoose.Types.ObjectId(req.body.oNftId),
          "nOwnedBy.address": req.body.oBuyer,
        }).select("nOwnedBy -_id");
        console.log("_NFTB-------->", _NFTB);
        console.log(
          "Quantity found for buyers",
          _NFTB.nOwnedBy.find(
            (o) => o.address === req.body.oBuyer.toLowerCase()
          ).quantity
        );
        currentQty = _NFTB.nOwnedBy.find(
          (o) => o.address === req.body.oBuyer.toLowerCase()
        ).quantity
          ? parseInt(
              _NFTB.nOwnedBy.find(
                (o) => o.address === req.body.oBuyer.toLowerCase()
              ).quantity
            )
          : 0;
        boughtQty = req.body.oQtyBought;
        let ownedQty = currentQty + boughtQty;
        await NFT.findOneAndUpdate(
          {
            _id: mongoose.Types.ObjectId(req.body.oNftId),
            "nOwnedBy.address": req.body.oBuyer,
          },
          {
            $set: {
              "nOwnedBy.$.quantity": parseInt(ownedQty),
            },
          },
          { upsert: true, runValidators: true }
        ).catch((e) => {
          console.log("Error1", e.message);
        });
      } else {
        console.log("Subdocument Id not found");
        let dataToadd = {
          address: req.body.oBuyer,
          quantity: parseInt(req.body.oQtyBought),
        };
        await NFT.findOneAndUpdate(
          { _id: mongoose.Types.ObjectId(req.body.oNftId) },
          { $addToSet: { nOwnedBy: dataToadd } },

          { upsert: true }
        );
        console.log("wasn't there but added");
        await NFT.findOneAndUpdate(
          { _id: mongoose.Types.ObjectId(req.body.oNftId) },
          {
            $set: {
              nLazyMintingStatus: Number(lazyMintingStatus),
            },
          }
        ).catch((e) => {
          console.log("Error1", e.message);
        });
        res.send("order");
      }
    } catch (error) {
      res.send(error);
    }
  },
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
  getOrdersByNftId: async (req, res) => {
    try {
      const sortKey = req.body.sortKey ? req.body.sortKey : oPrice;
      //sortType will let you choose from ASC 1 or DESC -1
      const sortType = req.body.sortType ? req.body.sortType : -1;
      var sortObject = {};
      var stype = sortKey;
      var sdir = sortType;
      sortObject[stype] = sdir;

      const page = parseInt(req.body.page);
      const limit = parseInt(req.body.limit);

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      const results = {};
      if (
        endIndex <
        (await Order.count({ oNftId: req.body.nftId, oStatus: 1 }).exec())
      ) {
        results.next = {
          page: page + 1,
          limit: limit,
        };
      }

      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit,
        };
      }
      let AllOrders = await Order.find({
        oNftId: req.body.nftId,
        oStatus: 1,
      })
        .sort(sortObject)
        .limit(limit)
        .skip(startIndex)
        .exec();

      results.results = AllOrders;
      return res.send("NFT Order List", results);
    } catch (error) {
      res.status(401).send(error);
    }
  },
};
