import User from "./../user/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const saltRounds = 10;

let signJWT = function (user) {
  return jwt.sign(
    {
      id: user._id,
      sRole: user.sRole,
    },
    process.env.JWT_SECRET,
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
            .send("User Created", {
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
          sWalletAddress: _.toChecksumAddress(req.body.sWalletAddress),
        },
        (err, user) => {
          if (err) return res.send(err);
          if (!user) return res.send("user not found");
          if (user && user.sRole == "user") {
            let token = signJWT(user);
            req.session["_id"] = user._id;
            req.session["sWalletAddress"] = user.sWalletAddress;
            req.session["sUsername"] = user.sUsername;
            return res.send("User Login ", {
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
};
