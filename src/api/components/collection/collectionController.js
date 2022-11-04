import fs from "fs";
import http from "http";
import aws from "aws-sdk";
import mongoose from "mongoose";
import pinataSDK from "@pinata/sdk";
import multer from "multer";
// import multerS3 from "multer-s3";
import "dotenv/config";
import logger from "../../middleware/logger";

import Collection from "./collectionModel";

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint("sgp1.digitaloceanspaces.com");
const s3 = new aws.S3({
  endpoint: "sgp1.digitaloceanspaces.com",
  accessKeyId: "P2YPJ7LF6WDBJSPFUAYL",
  secretAccessKey: "ELKZoA86+kAtvWVraYx3ZDLi5jswMZuu4Gb3q6Pu9J0",
});
// const storage = multerS3({
//   s3: s3,
//   bucket: process.env.BUCKET_NAME,
//   acl: "public-read",
//   contentType: multerS3.AUTO_CONTENT_TYPE,
//   key: function (request, file, cb) {
//     cb(null, file.originalname);
//   },
// });

var allowedMimes;
var errAllowed;

let fileFilter = function (req, file, cb) {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      {
        success: false,
        message: `Invalid file type! Only ${errAllowed}  files are allowed.`,
      },
      false
    );
  }
};

// let oMulterObj = {
//   storage: storage,
//   limits: {
//     fileSize: 15 * 1024 * 1024, // 15mb
//   },
//   fileFilter: fileFilter,
// };

// const upload = multer(oMulterObj).single("nftFile");

const pinata = new pinataSDK({
  pinataApiKey: "3ea7991864f4a7d2f998",
  pinataSecretApiKey:
    "5988caf8173c5cc986978b9bfd48060622830025ce80cc167f3c58d56ae29dbf",
});

module.exports = {
  createCollection: async (req, res) => {
    try {
      allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      errAllowed = "JPG, JPEG, PNG,GIF";

      // if (!req.body.sRoyaltyPercentage) {
      //   fs.unlinkSync(req.file.path);
      //   console.log("Royalty Percentages");
      // }
      // if (isNaN(req.body.sRoyaltyPercentage)) {
      //   logger.info("NaN");
      //   fs.unlinkSync(req.file.path);
      //   console.log("Royalty Percentages");
      // }

      // if (req.body.sRoyaltyPercentage < 0) {
      //   logger.info("Greater Than 0");
      //   fs.unlinkSync(req.file.path);
      //   // return res.reply(messages.invalid("Royalty Percentages"));
      //   console.log("Royalty Percentages");
      // }
      // if (!(req.body.sRoyaltyPercentage <= 10000)) {
      //   logger.info("Less Than 100");
      //   fs.unlinkSync(req.file.path);
      //   return res.reply(messages.invalid("Royalty Percentages"));
      // }

      // if (!validators.isValidString(req.body.sName)) {
      //   fs.unlinkSync(req.file.path);
      //   return res.reply(messages.invalid("Collection Name"));
      // }
      // if (req.body.sDescription.trim().length > 1000) {
      //   fs.unlinkSync(req.file.path);
      //   return res.reply(messages.invalid("Description"));
      // }
      const oOptions = {
        pinataMetadata: {
          name: req.file.originalname,
        },
        pinataOptions: {
          cidVersion: 0,
        },
      };

      const collection = new Collection({
        sHash: "demo",
        sName: req.body.sName,
        sDescription: req.body.sDescription,
        erc721: req.body.erc721,
        sContractAddress: req.body.sContractAddress,
        sRoyaltyPercentage: req.body.sRoyaltyPercentage,
        oCreatedBy: req.userId,
        nextId: 0,
        collectionImage: "demo",
      });
      await collection.save();
      res.send(collection);
    } catch (error) {
      res.send(error);
    }
  },
  collectionList: async (req, res, next) => {
    try {
      console.log("Request in Collection", req.body);

      const page = parseInt(req.body.page);
      const limit = parseInt(req.body.limit);
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const results = {};
      if (
        endIndex <
        (await Collection.countDocuments({
          oCreatedBy: { $in: [mongoose.Types.ObjectId(req.body.userId)] },
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
            oCreatedBy: mongoose.Types.ObjectId(req.body.userId),
          },
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
          $skip: (page - 1) * limit,
        },
        {
          $limit: limit,
        },
        {
          $sort: {
            sCreated: -1,
          },
        },
      ]);
      console.log("aCollections", aCollections);
      if (!aCollections) {
        return res.send("Collection Not Found");
      }
      results.results = aCollections;
      results.count = await Collection.countDocuments({
        oCreatedBy: { $in: [mongoose.Types.ObjectId(req.body.userId)] },
      }).exec();
      return res.send("Collection Request", results);
    } catch (error) {
      res.send(error);
    }
  },
};
