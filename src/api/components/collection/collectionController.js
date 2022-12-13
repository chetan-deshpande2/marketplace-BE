import fs from "fs";
import http from "http";
import aws from "aws-sdk";
import mongoose from "mongoose";

import multer from "multer";
import multerS3 from "multer-s3";
import minimist from "minimist";
import { Web3Storage, getFilesFromPath } from "web3.storage";
import { GridFsStorage } from "multer-gridfs-storage";
import util from "util";
import path from "path";
import logger from "../../middleware/logger";

import Collection from "./collectionModel";

const storage3 = new GridFsStorage({
  url: process.env.MONGODB_URL,

  file: (req, file) => {
    match = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (match.indexOf(file.mimetype) === -1) {
      const filename = file.originalname;
      return filename;
    }
    return filename;
  },
});

const upload2 = multer({ dest: "images/files", storage3 });

module.exports = {
  createCollection: async (req, res) => {
    console.log(req.userId);
    try {
      upload2.single("nftFile")(req, res, async (error) => {
        console.log(req.file.originalname);

        const token =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDlCMzlDMDMxQUQ2OTg0Mzk4RTQ1NzQ0YTk2YzNkMzc0ZDU0YURENTAiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2Njk3MzAwNDk1NTYsIm5hbWUiOiJtYXJrZXRwbGFjZSJ9.io0FvRpm6l-nbxxRGDMZii4s03ErdxJbGaC3yEHXzFM";

        if (!token) {
          console.error(
            "A token is needed. You can create one on https://web3.storage"
          );
          return;
        }
        const storage = new Web3Storage({ token });
        const files = await getFilesFromPath(req.file.path);
        const cid = await storage.put(files);
        console.log("Content added with CID:", cid);
        console.log(`http://${cid}.ipfs.w3s.link/${req.file.filename}`);

        const collection = new Collection({
          sHash: cid,
          sName: req.body.sName,
          sDescription: req.body.sDescription,
          erc721: req.body.erc721,
          sContractAddress: req.body.sContractAddress,
          sRoyaltyPercentage: req.body.sRoyaltyPercentage,
          oCreatedBy: req.userId,
          nextId: 0,
          collectionImage: req.file.location,
          sImageName: req.file.filename,
        });
        collection.save().then((result) => {
          console.log({ message: "Collection Created ", result });
          return;
        });
      });
    } catch (error) {
      res.status(401).send("cannot send data");
    }
  },

  collectionList: async (req, res, next) => {
    try {
      console.log("Request in Collection", req.userId);

      const page = parseInt(req.body.page);
      const limit = parseInt(req.body.limit);
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const results = {};
      if (
        endIndex <
        (await Collection.countDocuments({
          oCreatedBy: { $in: [mongoose.Types.ObjectId(req.userId)] },
        }).exec())
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

      let aCollections = await Collection.aggregate([
        {
          $match: {
            oCreatedBy: mongoose.Types.ObjectId(req.userId),
          },
        },
        {
          $lookup: {
            from: "user",
            localField: "oCreatedBy",
            foreignField: "_id",
            as: "oUser",
          },
        },
        // {
        //   $skip: (page - 1) * limit,
        // },
        // {
        //   $limit: limit,
        // },
        {
          $sort: {
            sCreated: -1,
          },
        },
      ]);

      if (!aCollections) {
        return res.send("Collection Not Found");
      }
      results.results = aCollections;
      results.count = await Collection.countDocuments({
        oCreatedBy: { $in: [mongoose.Types.ObjectId(req.userId)] },
      }).exec();
      return res.send(results);
    } catch (error) {
      return res.send(error);
    }
  },
  getCollectionDetails: async (req, res) => {
    try {
      Collection.findOne({ _id: req.body.collectionId }, (err, collection) => {
        if (err) return res.send("server error");
        if (!collection) return res.send("Collection Not Found");
        return res.send(collection);
      });
    } catch (error) {
      res.send(error);
    }
  },
  getCollectionDetailsByAddress: async (req, res) => {
    try {
      Collection.findOne(
        { sContractAddress: req.body.sContractAddress },
        (err, collection) => {
          if (err) return res.send("server error");
          if (!collection) return res.send("Collection Not Found");
          return res.send({ message: "Collection Details", collection });
        }
      );
    } catch (error) {
      res.send(error);
    }
  },
  getCollections: async (req, res) => {
    try {
      let aCollections = await Collection.find({});
      console.log("Collections", aCollections);

      if (!aCollections) {
        return res.send("Collection Not Found");
      }
      return res.send("Collection Details", aCollections);
    } catch (e) {
      return res.send(e);
    }
  },
  userCollectionList: async (req, res) => {
    try {
      if (!req.userId) return res.send("unauthorized");
      console.log(req.userId);

      var nLimit = parseInt(req.body.length);
      var nOffset = parseInt(req.body.start);

      let query = {
        oCreatedBy: mongoose.Types.ObjectId(req.userId),
      };
      if (req && req.body.sTextsearch && req.body.sTextsearch != undefined) {
        query["sName"] = new RegExp(req.body.sTextsearch, "i");
      }

      let aCollections = await Collection.aggregate([
        {
          $match: query,
        },
        {
          $lookup: {
            from: "users",
            localField: "oCreatedBy",
            foreignField: "_id",
            as: "oUser",
          },
        },
        {
          $unwind: { preserveNullAndEmptyArrays: true, path: "$oUser" },
        },
        {
          $sort: {
            sCreated: -1,
          },
        },
        {
          $facet: {
            collections: [
              {
                $skip: +nOffset,
              },
              {
                $limit: +nLimit,
              },
            ],
            totalCount: [
              {
                $count: "count",
              },
            ],
          },
        },
      ]);

      let iFiltered = aCollections[0].collections.length;
      if (aCollections[0].totalCount[0] == undefined) {
        return res.send("Data", {
          aCollections: 0,
          draw: req.body.draw,
          recordsTotal: 0,
          recordsFiltered: iFiltered,
        });
      } else {
        return res.send("Collection Details", {
          data: aCollections[0].collections,
          draw: req.body.draw,
          recordsTotal: aCollections[0].totalCount[0].count,
          recordsFiltered: iFiltered,
        });
      }
    } catch (error) {
      res.send(error);
    }
  },
  getCollectionNFT: async (req, res) => {
    try {
      let data = [];
      let collection = req.body.collection;

      const sortKey = req.body.sortKey ? req.body.sortKey : "";
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
      let orderQuery = {};

      orderQuery["oStatus"] = 1; // we are getting only active orders

      let OrderIdsss = await Order.distinct("oNftId", orderQuery);

      if (
        endIndex <
        (await NFT.countDocuments({
          nCollection: collection,
          _id: { $in: OrderIdsss },
        }).exec())
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

      await NFT.find({ nCollection: collection, _id: { $in: OrderIdsss } })
        .select({
          nTitle: 1,
          nCollection: 1,
          nHash: 1,
          nCreater: 1,
          nType: 1,
          nUser_likes: 1,
          nNftImage: 1,
          nLazyMintingStatus: 1,
        })
        .populate({
          path: "nOrders",
          options: {
            limit: 1,
          },
          select: {
            oPrice: 1,
            oType: 1,
            oValidUpto: 1,
            auction_end_date: 1,
            oStatus: 1,
            _id: 0,
          },
        })
        .populate({
          path: "nCreater",
          options: {
            limit: 1,
          },
          select: {
            _id: 1,
            sProfilePicUrl: 1,
            sWalletAddress: 1,
          },
        })
        .limit(limit)
        .skip(startIndex)
        .exec()
        .then((res) => {
          data.push(res);
        })
        .catch((e) => {
          console.log("Error", e);
        });
      results.count = await NFT.countDocuments({
        nCollection: collection,
        _id: { $in: OrderIdsss },
      }).exec();
      results.results = data;
      return res.send("Order List", results);
    } catch (error) {
      console.log("Error:", error);
      return res.send(error);
    }
  },
  getCollectionNFTOwned: async (req, res) => {
    try {
      if (!req.userId) return res.send("unauthorized");
      let data = [];
      let collection = req.body.collection;
      let userID = req.userId;
      let UserData = await User.findById(userID);
      if (UserData) {
        let userWalletAddress = UserData.sWalletAddress;

        const sortKey = req.body.sortKey ? req.body.sortKey : "";
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
          (await NFT.countDocuments({
            nCollection: collection,
            "nOwnedBy.address": userWalletAddress,
          }).exec())
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
        await NFT.find({
          nCollection: collection,
          "nOwnedBy.address": userWalletAddress,
        })
          .select({
            nTitle: 1,
            nCollection: 1,
            nHash: 1,
            nType: 1,
            nUser_likes: 1,
            nNftImage: 1,
            nLazyMintingStatus: 1,
          })
          .populate({
            path: "nOrders",
            options: {
              limit: 1,
            },
            select: {
              oPrice: 1,
              oType: 1,
              oStatus: 1,
              _id: 0,
            },
          })
          .populate({
            path: "nCreater",
            options: {
              limit: 1,
            },
            select: {
              _id: 1,
              sProfilePicUrl: 1,
              sWalletAddress: 1,
            },
          })
          .limit(limit)
          .skip(startIndex)
          .exec()
          .then((res) => {
            data.push(res);
          })
          .catch((e) => {
            console.log("Error", e);
          });
        results.count = await NFT.countDocuments({
          nCollection: collection,
          "nOwnedBy.address": userWalletAddress,
        }).exec();
        results.results = data;
        return res.send("Order List", results);
      } else {
        console.log("Bid Not found");
        return res.send("User Not found");
      }
    } catch (error) {
      console.log("Error:", error);
      return res.send(error);
    }
  },
  getSearchedNFT: async (req, res) => {
    try {
      let data = [];
      let setConditions = req.body.conditions;

      //sortKey is the column
      const sortKey = req.body.sortKey ? req.body.sortKey : "";

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
      let OrderIdsss = await Order.distinct("oNftId", setConditions);

      if (
        endIndex <
        (await NFT.countDocuments({
          nTitle: { $regex: req.body.sTextsearch, $options: "i" },
          _id: { $in: OrderIdsss.map(String) },
        }).exec())
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

      await NFT.find({
        nTitle: { $regex: req.body.sTextsearch, $options: "i" },
        _id: { $in: OrderIdsss.map(String) },
      })
        .select({
          nTitle: 1,
          nCollection: 1,
          nHash: 1,
          nType: 1,
          nUser_likes: 1,
          nNftImage: 1,
          nLazyMintingStatus: 1,
        })
        .populate({
          path: "nOrders",
          options: {
            limit: 1,
          },
          select: {
            oPrice: 1,
            oType: 1,
            auction_end_date: 1,
            oValidUpto: 1,
            oStatus: 1,
            _id: 0,
          },
        })
        .populate({
          path: "nCreater",
          options: {
            limit: 1,
          },
          select: {
            _id: 0,
          },
        })
        .limit(limit)
        .skip(startIndex)
        .exec()
        .then((res) => {
          data.push(res);
          results.count = res.length;
        })
        .catch((e) => {
          console.log("Error", e);
        });

      results.count = await NFT.countDocuments({
        nTitle: { $regex: req.body.sTextsearch, $options: "i" },
        _id: { $in: OrderIdsss.map(String) },
      }).exec();
      results.results = data;

      return res.send("NFTs List", results);
    } catch (error) {
      console.log("Error:", error);
      return res.send(error);
    }
  },

  updateCollectionToken: async (req, res) => {
    console.log(req.params.collectionAddress);
    try {
      if (!req.params.collectionAddress)
        return res.send("Contract Address Not Found");
      const contractAddress = req.params.collectionAddress;

      const collection = await Collection.findOne({
        sContractAddress: contractAddress,
      });
      let nextId = collection.getNextId();
      console.log(nextId);

      collection.nextId = nextId;

      collection.save();
      const data = nextId;
      console.log(nextId);
      return res.send({ message: "Collection Details", data });
    } catch (error) {
      return res.send(error);
    }
  },
};
