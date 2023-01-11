import mongoose from 'mongoose';
import multer from 'multer';
import { Web3Storage, getFilesFromPath } from 'web3.storage';
import { GridFsStorage } from 'multer-gridfs-storage';

import User from './userModel.js';
import NFT from '../nft/nftModel.js';

const storage3 = new GridFsStorage({
  url: process.env.MONGODB_URL,

  file: (req, file) => {
    match = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (match.indexOf(file.mimetype) === -1) {
      const filename = file.originalname;
      return filename;
    }
    return filename;
  },
});

const upload2 = multer({ dest: 'images/files', storage3 });

const getAddressById = async (req, res) => {
  console.log(req.body.sellerId);
  let id = req.body.sellerId;
  try {
    User.findById(id, (error, user) => {
      if (error) return res.send(error);
      console.log(user.sWalletAddress);
      res.send({ message: 'User Address', userAddress: user.sWalletAddress });
    });
  } catch (error) {
    res.send(error);
  }
};

const profile = async (req, res) => {
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
        sHash: 1,
        sImageName: 1,
        sWebsite: 1,
        sBio: 1,
        user_followings_size: {
          $cond: {
            if: {
              $isArray: '$user_followings',
            },
            then: {
              $size: '$user_followings',
            },
            else: 0,
          },
        },
        user_followers_size: 1,
      },
      (err, user) => {
        if (err) return res.send('server Error');
        if (!user) return res.send('user not found');
        console.log({ message: 'user found', user });
        return res.send({ message: 'user found', user });
      }
    );
  } catch (error) {
    res.send(error);
  }
};

const updateProfile = async (req, res) => {
  try {
    if (!req.userId) return res.send('UnAuthorized');

    console.log(req.userId);
    let oProfileDetails = {};

    upload2.single('userProfile')(req, res, async (error) => {
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDlCMzlDMDMxQUQ2OTg0Mzk4RTQ1NzQ0YTk2YzNkMzc0ZDU0YURENTAiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2Njk3MzAwNDk1NTYsIm5hbWUiOiJtYXJrZXRwbGFjZSJ9.io0FvRpm6l-nbxxRGDMZii4s03ErdxJbGaC3yEHXzFM';

      if (!token) {
        return;
      }
      const storage = new Web3Storage({ token });
      const files = await getFilesFromPath(req.file.path);
      const cid = await storage.put(files);
      console.log('Content added with CID:', cid);
      console.log(`http://${cid}.ipfs.w3s.link/${req.file.filename}`);
      console.log(`http://${cid}.ipfs.w3s.link/${req.file.filename}`);

      await User.findOne(
        {
          sUserName: req.userId,
        },
        async (err, user) => {
          if (err) return res.send('user not found');
          if (user)
            if (user._id.toString() !== req.userId.toString()) {
              return res.send({ message: 'user Already Exists' });
            }
          console.log('P1');
          oProfileDetails = {
            sUserName: req.body.sUserName,
            oName: {
              sFirstname: req.body.sFirstname,
              sLastname: req.body.sLastname,
            },
            sWebsite: req.body.sWebsite,
            sBio: req.body.sBio,
            sEmail: req.body.sEmail,
            sImageName: req.file.filenames,
            sHash: cid,
          };
          console.log('here--->>');
          await User.findByIdAndUpdate(
            req.userId,
            oProfileDetails,
            (err, user) => {
              if (err) return res.send('Server Error');
              if (!user) return res.send('user not found');
              return res.send('User Details Updated');
            }
          );
        }
      );
    });
  } catch (error) {
    res.send(error);
  }
};

const getAllUserDetails = async (req, res) => {
  try {
    let data = [];
    const page = parseInt(req.body.page);
    const limit = parseInt(req.body.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let searchText = req.body.searchText;
    let UserSearchArray = [];
    if (req.body.userId) {
      UserSearchArray['_id'] = {
        $ne: mongoose.Types.ObjectId(req.body.userId),
      };
    }
    let UserSearchObj = Object.assign({}, UserSearchArray);
    console.log(UserSearchObj);
    let totalCount = 0;
    if (searchText == '') {
      totalCount = await User.countDocuments(UserSearchObj).exec();
    } else {
      totalCount = await User.countDocuments({
        _id: { $ne: mongoose.Types.ObjectId(req.body.userId) },
        $or: [
          {
            $expr: {
              $regexMatch: {
                input: { $concat: ['$Name.Firstname', ' ', '$Name.Lastname'] },
                regex: new RegExp(searchText), //Your text search here
                options: 'i',
              },
            },
          },
          { username: { $regex: new RegExp(searchText), $options: 'i' } },
          { sWalletAddress: { $regex: new RegExp(searchText), $options: 'i' } },
        ],
      }).exec();
    }

    const results = {};
    if (endIndex < totalCount) {
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
    if (searchText !== '') {
      await User.find(UserSearchObj)
        .find({
          $or: [
            {
              $expr: {
                $regexMatch: {
                  input: {
                    $concat: ['$Name.Firstname', ' ', '$Name.Lastname'],
                  },
                  regex: new RegExp(searchText), //Your text search here
                  options: 'i',
                },
              },
            },
            { username: { $regex: new RegExp(searchText), $options: 'i' } },
            {
              swalletAddress: { $regex: new RegExp(searchText), $options: 'i' },
            },
          ],
        })
        .sort({ sCreated: -1 })
        .select({
          swalletAddress: 1,
          username: 1,
          email: 1,
          Name: 1,
          srole: 1,
          sCreated: 1,
          sStatus: 1,
          sHash: 1,
          bio: 1,
          Website: 1,
          profileIcon: 1,
          aCollaborators: 1,
          sResetPasswordToken: 1,
          sResetPasswordExpires: 1,
          is_user_following: 'false',
          user_followings: 1,
        })
        .limit(limit)
        .skip(startIndex)
        .lean()
        .exec()
        .then((res) => {
          data.push(res);
        })
        .catch((e) => {
          console.log('Error', e);
        });
    } else {
      await User.find(UserSearchObj)
        .sort({ sCreated: -1 })
        .select({
          swalletAddress: 1,
          username: 1,
          email: 1,
          Name: 1,
          srole: 1,
          sCreated: 1,
          sStatus: 1,
          sHash: 1,
          bio: 1,
          Website: 1,
          profileIcon: 1,
          aCollaborators: 1,
          sResetPasswordToken: 1,
          sResetPasswordExpires: 1,
          is_user_following: 'false',
          user_followings: 1,
        })
        .limit(limit)
        .skip(startIndex)
        .lean()
        .exec()
        .then((res) => {
          data.push(res);
        })
        .catch((e) => {
          console.log('Error', e);
        });
    }
    results.count = totalCount;
    results.results = data;
    return res.send(results);
  } catch (error) {
    return res.send(error);
  }
};

const addCollaborator = async (req, res) => {
  try {
    if (!req.userId) return res.send('unauthorized user');
    if (!req.body) return res.send('Collaborator Details Not Found');

    // req.body.sAddress = _.toChecksumAddress(req.body.sAddress);

    User.findById(req.userId, (err, user) => {
      if (err) return res.send('Server Error');
      if (!user) return res.send('User Not Found');

      if (user.sWalletAddress == req.body.sAddress)
        return res.send("You Can't Add Yourself As a Collaborator");

      let aUserCollaborators = user.aCollaborators;
      let bAlreadyExists;
      aUserCollaborators.forEach((oCollaborator) => {
        if (oCollaborator.sAddress == req.body.sAddress) bAlreadyExists = true;
      });

      if (bAlreadyExists) return res.send('Collaborator Already Exist');

      oCollaboratorDetails = {
        $push: {
          aCollaborators: [req.body],
        },
      };
      User.findByIdAndUpdate(req.userId, oCollaboratorDetails, (err, user) => {
        if (err) return res.send('Server Error');
        if (!user) return res.send('User Not Found');

        return res.send('Collaborator Added');
      });
    });
  } catch (error) {
    return res.send(error);
  }
};

const collaboratorList = async (req, res) => {
  try {
  } catch (error) {}
};
const getCollaboratorList = async (req, res) => {
  try {
  } catch (error) {}
};
const deleteCollaborator = async (req, res) => {
  try {
  } catch (error) {}
};

const getUserWithNfts = async (req, res) => {
  try {
  } catch (error) {}
};

const getUserProfilewithNfts = async (req, res) => {
  console.log('req', req.body);
  try {
    if (!req.body.userId) {
      return res.send('unauthorized');
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
                input: '$user_followings',
                as: 'user_followings',
                cond: {
                  $eq: [
                    '$$user_followings',
                    mongoose.Types.ObjectId(req.body.currUserId),
                  ],
                },
              },
            }
          : [],
        user_followings_size: {
          $cond: {
            if: {
              $isArray: '$user_followings',
            },
            then: {
              $size: '$user_followings',
            },
            else: 0,
          },
        },
        user_followers_size: 1,
      },
      (err, user) => {
        if (err) return res.send('server error');
        if (!user) return res.send('user not found');

        return res.send({ message: 'User Details', user });
      }
    );
  } catch (error) {
    return res.send(error);
  }
};
const editCollaborator = async (req, res) => {
  try {
  } catch (error) {}
};
const getCollaboratorName = async (req, res) => {
  try {
  } catch (error) {}
};

export {
  getAddressById,
  profile,
  updateProfile,
  addCollaborator,
  getCollaboratorName,
  editCollaborator,
  getUserProfilewithNfts,
  getUserWithNfts,
  getAllUserDetails,
  deleteCollaborator,
  getCollaboratorList,
  collaboratorList,
};
