import fs from "fs";
import http from "http";

import mongoose from "mongoose";
import pinataSDK from "@pinata/sdk";
import multer from "multer";
// import multerS3 from "multer-s3";
import "dotenv/config";

import { Collection } from "./nftModel";

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
      let {
        sHash,
        collectionImage,
        sContractAddress,
        erc721,
        nextId,
        sCreated,
        oCreatedBy,
        sRoyaltyPercentage,
        sName,
        sDescription,
      } = req.body;
      upload(req, res, (error) => {
        if (error) {
          fs.unlinkSync(req.file.path);
          return res.send(bad_request(error.message));
        } else {
          //   if (!req.body.sName) {
          //     fs.unlinkSync(req.file.path);
          //     return res.send("Collection not found");
          //   }
          //   if (!req.file) {
          //     fs.unlinkSync(req.file.path);
          //     return res.send(not_found("File"));
          //   }
          //   if (!req.body.sRoyaltyPercentage) {
          //     fs.unlinkSync(req.file.path);
          //     return res.send(not_found("Royalty Percentages"));
          //   }
          //   if (isNaN(req.body.sRoyaltyPercentage)) {
          //     logger.info("NaN");
          //     fs.unlinkSync(req.file.path);
          //     return res.send(invalid("Royalty Percentages"));
          //   }
          //   if (req.body.sRoyaltyPercentage < 0) {
          //     logger.info("Greater Than 0");
          //     fs.unlinkSync(req.file.path);
          //     return res.send(invalid("Royalty Percentages"));
          //   }
          //   if (!(req.body.sRoyaltyPercentage <= 10000)) {
          //     logger.info("Less Than 100");
          //     fs.unlinkSync(req.file.path);
          //     return res.send(invalid("Royalty Percentages"));
          //   }
          //   if (!validators.isValidString(req.body.sName)) {
          //     fs.unlinkSync(req.file.path);
          //     return res.send(invalid("Collection Name"));
          //   }
          //   if (req.body.sDescription.trim().length > 1000) {
          //     fs.unlinkSync(req.file.path);
          //     return res.send(invalid("Description"));
          //   }

          const oOptions = {
            pinataMetadata: {
              name: req.file.originalname,
            },
            pinataOptions: {
              cidVersion: 0,
            },
          };
          try {
            const pathString = "/tmp/";
            const file = fs.createWriteStream(
              pathString + req.file.originalname
            );
            const request = http.get(`${req.file.location}`, (response) => {
              var stream = response.pipe(file);
              const readableStreamForFile = fs.createReadStream(
                pathString + req.file.originalname
              );

              stream.on("finish", async () => {
                pinata
                  .then(async (file2) => {
                    const collection = new Collection({
                      sHash: file2.IpfsHash,
                      sName: req.body.sName,
                      sDescription: req.body.sDescription,
                      erc721: req.body.erc721,
                      sContractAddress: req.body.sContractAddress,
                      sRoyaltyPercentage: req.body.sRoyaltyPercentage,
                      oCreatedBy: req.userId,
                      nextId: 0,
                      collectionImage: req.file.location,
                    });
                    console.log(result);
                    collection
                      .save()
                      .then((result) => {
                        return res.send("collection created", result);
                      })
                      .catch((error) => {
                        return res.send("error", error);
                      });
                  })
                  .catch((error) => {
                    return res.send(error);
                  });
              });
            });
          } catch (error) {
            console.log("error in file upload..", error);
          }
        }
      });
    } catch (error) {
      res.send(error);
    }
  },
  testPinata: (req, res) => {
    pinata
      .testAuthentication()
      .then((result) => {
        res.send(result);
      })
      .catch((err) => {
        res.send(err);
      });
  },
};
