import fs from "fs";
import http from "http";
import aws from "aws-sdk";
import mongoose from "mongoose";
import pinataSDK from "@pinata/sdk";
import multer from "multer";
import multerS3 from "multer-s3";

import User from "./userModel";
import NFT from "../nft/nftModel";
import { Web3Storage, getFilesFromPath } from "web3.storage";
import { GridFsStorage } from "multer-gridfs-storage";

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
      console.log("inside try");
      if (!req.userId) return res.send("UnAuthorized");
      console.log(req.userId);
      let oProfileDetails = {};

      upload2("userProfile")(req, res, async (error) => {
        console.log("inside");


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

        await User.findOne(
          {
            sUserName: req.userId,
          },
          async (err, user) => {
            if (err) return res.send("user not found");
            if (user)
              if (user._id.toString() !== req.userId.toString()) {
                return res.send({ message: "user Already Exists" });
              }
            console.log("P1");
            oProfileDetails = {
              sUserName: req.body.sUserName,
              oName: {
                sFirstname: req.body.sFirstname,
                sLastname: req.body.sLastname,
              },
              sWebsite: req.body.sWebsite,
              sBio: req.body.sBio,
              sEmail: req.body.sEmail,
              sImageName: req.file.originalname,
              sHash: cid,
            };
            console.log("here--->>");
            await User.findByIdAndUpdate(
              req.userId,
              oProfileDetails,
              (err, user) => {
                if (err) return res.send("Server Error");
                if (!user) return res.send("user not found");
                return res.send("User Details Updated");
              }
            );
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
      return res.send(error);
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
