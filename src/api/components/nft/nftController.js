import fs from "fs";
import http from "http";
import aws from "aws-sdk";
import mongoose from "mongoose";
import pinataSDK from "@pinata/sdk";
import multer from "multer";

import logger from "../../middleware/logger";
import NFT from "./nftModel";
import Collection from "../collection/collectionModel";
import multerS3 from "multer-s3";

import "dotenv/config";

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
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15mb
  },
  fileFilter: fileFilter,
};

const upload = multer(oMulterObj).single("nftFile");

const pinata = new pinataSDK({
  pinataApiKey: "3ea7991864f4a7d2f998",
  pinataSecretApiKey:
    "5988caf8173c5cc986978b9bfd48060622830025ce80cc167f3c58d56ae29dbf",
});

module.exports = {
  create: async (req, res, next) => {
    try {
      allowedMimes = [
        "image/jpeg",
        "video/mp4",
        "image/jpg",
        "image/webp",
        "image/png",
        "image/gif",
        "audio/mp3",
        "audio/mpeg",
      ];
      errAllowed = "JPG, JPEG, PNG, GIF, MP3, WEBP & MPEG";
      let metaData = req.body.metaData;
      upload(req, res, (error) => {
        const iOptions = {
          pinataMetadata: {
            name: req.file.originalname,
          },
          pinataOptions: {
            cidVersion: 0,
          },
        };
        try {
          const pathString = "/tmp/";
          const file = fs.createWriteStream(pathString + req.file.originalname);
          const request = http.get(`${req.file.location}`, (response) => {
            var stream = response.pipe(file);
            const readableStreamForFile = fs.createReadStream(
              pathString + req.file.originalname
            );
            stream.on("finish", async () => {
              pinata
                .pinFileToIPFS(readableStreamForFile, iOptions)
                .then((res) => {
                  metaData = JSON.parse(req.body.metaData);
                  let uploadingData = {};
                  uploadingData = {
                    description: req.body.description,
                    external_url: "", // This is the URL that will appear below the asset's image on OpenSea and will allow users to leave OpenSea and view the item on your site.
                    image: "https://ipfs.io/ipfs/" + res.IpfsHash,
                    name: req.body.nTitle,
                    attributes: req.body.metaData,
                  };
                  console.log("uploadingData", uploadingData);
                  const mOptions = {
                    pinataMetadata: {
                      name: "hello",
                    },
                    pinataOptions: {
                      cidVersion: 0,
                    },
                  };
                  console.log("res---", res.IpfsHash);
                  return pinata.pinJSONToIPFS(uploadingData, mOptions);
                })
                .then(async (file2) => {
                  console.log("file2---", file2);
                  console.log("file location", "https://" + req.file.location);
                  const contractAddress = req.body.nCollection;
                  const creatorAddress = req.body.nCreatorAddress;
                  const nft = new NFT({
                    nTitle: req.body.nTitle,
                    nCollection:
                      req.body.nCollection && req.body.nCollection != undefined
                        ? req.body.nCollection
                        : "",
                    nHash: file2.IpfsHash,
                    nOwnedBy: [], //setting ownedby for first time empty
                    nQuantity: req.body.nQuantity,
                    nCollaborator: req.body.nCollaborator.split(","),
                    nCollaboratorPercentage: req.body.nCollaboratorPercentage
                      .split(",")
                      .map((percentage) => +percentage),
                    nRoyaltyPercentage: req.body.nRoyaltyPercentage,
                    nDescription: req.body.nDescription,
                    nCreater: req.userId,
                    nTokenID: req.body.nTokenID,
                    nType: req.body.nType,
                    nLockedContent: req.body.lockedContent,
                    nNftImage: req.file.location,
                    nLazyMintingStatus: req.body.nLazyMintingStatus,
                  });
                  nft.nOwnedBy.push({
                    address: creatorAddress.toLowerCase(),
                    quantity: req.body.nQuantity,
                  });
                  nft
                    .save()
                    .then(async (result) => {
                      //increment collection nextId by 1
                      //update the collection and increment the nextId

                      const collection = await Collection.findOne({
                        sContractAddress: contractAddress,
                      });
                      let nextId = collection.getNextId();
                      collection.nextId = nextId;
                      collection.save();

                      return res.reply(messages.created("NFT"), result);
                    })
                    .catch((error) => {
                      console.log("Created NFT error", error);
                      return res.reply(messages.error());
                    });
                });
            });
          });
        } catch (error) {
          console.log("error in file upload..", error);
        }
      });
    } catch (error) {
      res.send("error", error);
    }
  },
  setNFTOrder: async (req, res) => {
    res.send("set NFT order");
  },
};
