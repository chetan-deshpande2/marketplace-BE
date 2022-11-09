import fs from "fs";
import http from "http";
import aws from "aws-sdk";
import mongoose from "mongoose";
import pinataSDK from "@pinata/sdk";
import multer from "multer";
import multerS3 from "multer-s3";

import uuid from "uuid";
import logger from "../../middleware/logger";

import Collection from "./collectionModel";
import User from "../user/userModel";

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint("sgp1.digitaloceanspaces.com");
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: "P2YPJ7LF6WDBJSPFUAYL",
  secretAccessKey: "ELKZoA86+kAtvWVraYx3ZDLi5jswMZuu4Gb3q6Pu9J0",
});

const storage = multerS3({
  s3: s3,
  bucket: "staging-decrypt-nft-io",
  acl: "public-read",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (request, file, cb) {
    cb(null, file.originalname);
  },
});

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

let oMulterObj = {
  storage: storage1,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15mb
  },
  fileFilter: fileFilter,
};

const storage1 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const { originalname } = file;

    cb(null, `${uuid()}-${originalname}`);
  },
});

const upload = multer(oMulterObj);
const uploadBanner = multer(oMulterObj);

const pinata = new pinataSDK({
  pinataApiKey: "3ea7991864f4a7d2f998",
  pinataSecretApiKey:
    "5988caf8173c5cc986978b9bfd48060622830025ce80cc167f3c58d56ae29dbf",
});

module.exports = {
  uploadCollection: async (req, res, next) => {
    try {
      res.send("Successfully uploaded " + req.files.length + " files!");
    } catch (error) {
      res.status(401).send("cannot send data");
    }
  },
  createCollection: async (req, res) => {
    // if (!req.userId) return res.send("unauthorized");
    const userId = "636b479b2fe65b13dc53b690";
    try {
      allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      errAllowed = "JPG, JPEG, PNG,GIF";

      uploadBanner.single("nftFile")(req, res, (error) => {
        if (error) {
          res.send(error);
        } else {
          let filename = req.file.originalname;
          console.log(req.file.originalname);
          res.send(filename);
        }

        const oOptions = {
          pinataMetadata: {
            name: req.file.originalname,
          },
          pinataOptions: {
            cidVersion: 0,
          },
        };
        const pathString = "/tmp/";
        const file = fs.createWriteStream(pathString + req.file.originalname);

        const request = http.get("http://localhost:3000/", (response) => {
          var stream = response.pipe(file);
          const readableStreamForFile = fs.createReadStream(
            pathString + req.file.originalname
          );
          console.log("userId", req.userId);
          stream.on("finish", async () => {
            pinata
              .pinFileToIPFS(readableStreamForFile, oOptions)
              .then(async (file2) => {
                const collection = new Collection({
                  sHash: file2.IpfsHash,
                  sName: req.body.sName,
                  sDescription: req.body.sDescription,
                  erc721: req.body.erc721,
                  sContractAddress: req.body.sContractAddress,
                  sRoyaltyPercentage: req.body.sRoyaltyPercentage,
                  oCreatedBy: userId,
                  nextId: 0,
                  collectionImage: req.file.location,
                });
                collection.save().then((result) => {
                  console.log(result);
                  return result;
                });
              })
              .catch((error) => {
                res.status(401).send("Collection Already exists");
              });
          });
        });
      });
    } catch (error) {
      res.status(401).send(error);
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