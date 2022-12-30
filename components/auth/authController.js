import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './../user/userModel.js';

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
      expiresIn: '1d',
    }
  );
};

const register = async (req, res) => {
  try {
    if (!req.body.sWalletAddress) return res.send('require wallet Address');
    bcrypt.hash(req.body.sWalletAddress, saltRounds, (err, hash) => {
      if (err) return res.send(err);
      const user = new User({
        sWalletAddress: req.body.sWalletAddress,
        sStatus: 'active',
      });
      user.save().then((err, result) => {
        let token = signJWT(user);
        console.log(token);
        // req.session["_id"] = user._id;
        // req.session["sWalletAddress"] = user.sWalletAddress;
        return res.send({
          message: 'user Details',
          auth: true,
          token,
          sWalletAddress: user.sWalletAddress,
        });
      });
    });
  } catch (error) {
    return res.send('error ');
  }
};
const login = async (req, res) => {
  try {
    if (!req.body.sWalletAddress) return res.send('require wallet Address');
    User.findOne(
      {
        sWalletAddress: req.body.sWalletAddress,
      },
      (err, user) => {
        if (err) return res.send(err);
        if (!user) return res.send('user not found');
        if (user && user.sRole == 'user') {
          let token = signJWT(user);
          // req.session["_id"] = user._id;
          // req.session["sWalletAddress"] = user.sWalletAddress;
          // req.session["sUsername"] = user.sUsername;
          return res.send({
            auth: true,
            token,
            sWalletAddress: user.sWalletAddress,
            userId: user._id,
            user: true,
          });
        } else {
          return res.send('Invalid Login');
        }
      }
    );
  } catch (error) {
    res.send(error);
  }
};
const checkUserAddress = async (req, res) => {
  try {
    if (!req.body.sWalletAddress) return res.send('Wallet Address');

    User.findOne(
      {
        sWalletAddress: req.body.sWalletAddress,
      },
      (err, user) => {
        if (err) return res.send(err);
        if (!user)
          return res.send({
            message: 'User Not Found',
            user: true,
          });
        return res.send({
          message: 'User Found',
          user: true,
          sStatus: user.sStatus,
        });
      }
    );
  } catch (error) {
    return res.send(error);
  }
};
const Logout = async (req, res) => {
  try {
    if (!req.userId) return res.send('unauthorized');
    console.log('User Id', req.userId);
    User.findOne(
      {
        _id: req.userId,
      },
      (err, user) => {
        if (err) return res.send('server error');
        if (!user) return res.send('user not found');
        return res.send({ message: 'Logout', auth: false, token: null });
      }
    );
  } catch (error) {
    res.send(error);
  }
};

export { register, login, checkUserAddress, Logout };
