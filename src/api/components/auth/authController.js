import dotenv from "dotenv";

import User from "./../user/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
dotenv.config();

const saltRounds = 10;

let signJWT = function (user) {
  return jwt.sign(
    {
      id: user._id,
      sRole: user.sRole,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "1d",
    }
  );
};

module.exports = {
  register: async (req, res) => {
    try {
      if (!req.body.sWalletAddress) return res.send("require wallet Address");
      bcrypt.hash(req.body.sWalletAddress, saltRounds, (err, hash) => {
        if (err) return res.send(err);
        const user = new User({
          sWalletAddress: req.body.sWalletAddress,
          sStatus: "active",
        });
        user.save().then((err, result) => {
          let token = signJWT(user);
          console.log(token);
          req.session["_id"] = user._id;
          req.session["sWalletAddress"] = user.sWalletAddress;
          return res
            .send({
              auth: true,
              token,
              sWalletAddress: user.sWalletAddress,
            })
            .catch(res.send("user Already exits"));
        });
      });
    } catch (error) {
      res.send(error);
    }
  },
  login: async (req, res) => {
    try {
      if (!req.body.sWalletAddress) return res.send("require wallet Address");
      User.findOne(
        {
          sWalletAddress: req.body.sWalletAddress,
        },
        (err, user) => {
          if (err) return res.send(err);
          if (!user) return res.send("user not found");
          if (user && user.sRole == "user") {
            let token = signJWT(user);
            req.session["_id"] = user._id;
            req.session["sWalletAddress"] = user.sWalletAddress;
            req.session["sUsername"] = user.sUsername;
            return res.send({
              auth: true,
              token,
              sWalletAddress: user.sWalletAddress,
              userId: user._id,
              user: true,
            });
          } else {
            return res.send("Invalid Login");
          }
        }
      );
    } catch (error) {
      res.send(error);
    }
  },
  checkUserAddress: async (req, res) => {
    try {
      if (!req.body.walletAddress) return res.send("Wallet Address");
      // if (!validators.isValidWalletAddress(req.body.walletAddress))
      //   return res.reply(messages.invalid("Wallet Address"));

      User.findOne(
        {
          walletAddress: req.body.sWalletAddress,
          // walletAddress: _.toChecksumAddress(req.body.walletAddress),
        },
        (err, user) => {
          if (err) return res.send(err);
          if (!user)
            return res.status(400).send({
              user: true,
            });
          return res.status(302).send({
            user: true,
            status: user.status,
          });
        }
      );
    } catch (error) {
      return res.send(error);
    }
  },
  Logout: async (req, res) => {
    try {
    } catch (error) {}
  },
};
