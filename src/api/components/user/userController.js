import fs from "fs";
import http from "http";
import aws from "aws-sdk";
import mongoose from "mongoose";
import pinataSDK from "@pinata/sdk";
import multer from "multer";
import multerS3 from "multer-s3";

import User from "./userModel";
import NFT from "../nft/nftModel";

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
  key: (request, file, cb) => {
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
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15mb
  },
  fileFilter: fileFilter,
};

const upload = multer(oMulterObj).single("userProfile");

const pinata = new pinataSDK({
  pinataApiKey: "3ea7991864f4a7d2f998",
  pinataSecretApiKey:
    "5988caf8173c5cc986978b9bfd48060622830025ce80cc167f3c58d56ae29dbf",
});

module.exports = {
  profile: async (req, res) => {
    try {
      User.findOne(
        {
          _id: req.userId,
        },
        {
          oName: 1,
          sUserName: 1,
          sCreated: 1,
          sEmail: 1,
          sWalletAddress: 1,
          sProfilePicUrl: 1,
          sWebsite: 1,
          sBio: 1,
          user_followings_size: {
            $cond: {
              if: {
                $isArray: "$user_followings",
              },
              then: {
                $size: "$user_followings",
              },
              else: 0,
            },
          },
          user_followers_size: 1,
        },
        (err, user) => {
          if (err) return res.send("server Error");
          if (!user) return res.send("user not found");
          return res.send("User Details", user);
        }
      );
    } catch (error) {
      res.send(error);
    }
  },
  updateProfile: async (req, res) => {
    try {
      if (!req.userId) return res.send("UnAuthorized");
      // File upload
      let oProfileDetails = {};
      upload(req, res, async (error) => {
        if (error) return res.send("bad Request");
        await User.findOne(
          {
            sUserName: req.body.sUsername,
          },
          async (err, user) => {
            if (err) return res.send("user not found");
            if (user)
              if (user._id.toString() !== req.userId.toString()) {
                return res.send(
                  "User with Username ' " + req.body.sUserName + "'"
                );
              }
          }
        );
      });
    } catch (error) {
      res.send(error);
    }
  },
  addCollabrator: async (req, res) => {},
};
