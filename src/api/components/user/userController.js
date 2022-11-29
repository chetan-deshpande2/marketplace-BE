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

    cb(null, `${originalname}`);
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
          console.log({ message: "user found", user });
          return res.send({ message: "user found", user });
        }
      );
    } catch (error) {
      res.send(error);
    }
  },
  updateProfile: async (req, res) => {
    try {
      if (!req.userId) return res.send("UnAuthorized");
      console.log(req.userId);
      // File upload
      let oProfileDetails = {};
      uploadBanner("single")(req, res, async (error) => {
        if (error) return res.send("bad Request");
        await User.findOne(
          {
            sUserName: req.userId,
          },
          (err, user) => {
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
  addCollaborator: async (req, res) => {
    try {
      if (!req.userId) return res.send("unauthorized user");
      if (!req.body) return res.send("Collaborator Details Not Found");

      // req.body.sAddress = _.toChecksumAddress(req.body.sAddress);

      User.findById(req.userId, (err, user) => {
        if (err) return res.send("Server Error");
        if (!user) return res.send("User Not Found");

        if (user.sWalletAddress == req.body.sAddress)
          return res.send("You Can't Add Yourself As a Collaborator");

        let aUserCollaborators = user.aCollaborators;
        let bAlreadyExists;
        aUserCollaborators.forEach((oCollaborator) => {
          if (oCollaborator.sAddress == req.body.sAddress)
            bAlreadyExists = true;
        });

        if (bAlreadyExists) return res.send("Collaborator Already Exist");

        oCollaboratorDetails = {
          $push: {
            aCollaborators: [req.body],
          },
        };
        User.findByIdAndUpdate(
          req.userId,
          oCollaboratorDetails,
          (err, user) => {
            if (err) return res.send("Server Error");
            if (!user) return res.send("User Not Found");

            return res.send("Collaborator Added");
          }
        );
      });
    } catch (error) {
      return res.send(error);
    }
  },
  collaboratorList: async (req, res) => {
    try {
    } catch (error) {}
  },
  getCollaboratorList: async (req, res) => {
    try {
    } catch (error) {}
  },
  deleteCollaborator: async (req, res) => {
    try {
    } catch (error) {}
  },
  getAllUserDetails: async (req, res) => {
    try {
    } catch (error) {}
  },
  getUserWithNfts: async (req, res) => {
    try {
    } catch (error) {}
  },

  getUserProfilewithNfts: async (req, res) => {
    console.log("req", req.body);
    try {
      if (!req.body.userId) {
        return res.send("unauthorized");
      }
      User.findOne(
        {
          _id: req.body.userId,
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
          user_followings: req.body.currUserId
            ? {
                $filter: {
                  input: "$user_followings",
                  as: "user_followings",
                  cond: {
                    $eq: [
                      "$$user_followings",
                      mongoose.Types.ObjectId(req.body.currUserId),
                    ],
                  },
                },
              }
            : [],
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
          if (err) return res.send("server error");
          if (!user) return res.send("user not found");

          return res.send({ message: "User Details", user });
        }
      );
    } catch (error) {
      log.red(error);
      return res.reply(messages.server_error());
    }
  },
  editCollaborator: async (req, res) => {
    try {
    } catch (error) {}
  },
  getCollaboratorName: async (req, res) => {
    try {
    } catch (error) {}
  },
};
