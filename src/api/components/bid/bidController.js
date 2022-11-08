import fs from "fs";
import http from "http";
import aws from "aws-sdk";
import mongoose from "mongoose";
import pinataSDK from "@pinata/sdk";
import multer from "multer";
import multerS3 from "multer-s3";
import uuid from "uuid";

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

// const pinata = new pinataSDK({
//   pinataApiKey: "3ea7991864f4a7d2f998",
//   pinataSecretApiKey:
//     "5988caf8173c5cc986978b9bfd48060622830025ce80cc167f3c58d56ae29dbf",
// });

const storage1 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const { originalname } = file;

    cb(null, `${uuid()}-${originalname}`);
  },
});

const upload = multer(oMulterObj).single("nftFile");
const uploadBanner = multer(oMulterObj);

module.exports = {
  multerCheck: async (req, res) => {
    allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    errAllowed = "JPG, JPEG, PNG,GIF";
    uploadBanner.single("NFTImage")(req, res, (error) => {
      if (error) {
        res.send(error);
      } else {
        console.log(req.file.originalname);
      }
    });
  },
};
