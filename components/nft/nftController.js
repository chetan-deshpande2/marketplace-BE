import { Web3Storage, getFilesFromPath } from 'web3.storage';
import fs, { writeFile, createReadStream } from 'fs';
import http from 'http';
import aws from 'aws-sdk';
import mongoose from 'mongoose';
import pinataSDK from '@pinata/sdk';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { GridFsStorage } from 'multer-gridfs-storage';
import multerS3 from 'multer-s3';

import NFT from './nftModel.js';
import NFTowners from './nftOwnerModel.js';
import Order from '../order/orderModel.js';
import Collection from '../collection/collectionModel.js';

const spacesEndpoint = new aws.Endpoint('sgp1.digitaloceanspaces.com');
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
  accessKeyId: 'P2YPJ7LF6WDBJSPFUAYL',
  secretAccessKey: 'ELKZoA86+kAtvWVraYx3ZDLi5jswMZuu4Gb3q6Pu9J0',
});

const storage = multerS3({
  s3,
  bucket: 'staging-decrypt-nft-io',
  acl: 'public-read',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key(request, file, cb) {
    cb(null, file.originalname);
  },
});

let allowedMimes;
let errAllowed;

const fileFilter = function (req, file, cb) {
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

const storage1 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    const { originalname } = file;

    cb(null, `${uuid()}-${originalname}`);
  },
});

const oMulterObj = {
  storage: storage1,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15mb
  },
  fileFilter,
};

const upload = multer(oMulterObj);
const uploadBanner = multer(oMulterObj);
const pinata = new pinataSDK({
  pinataApiKey: '3ea7991864f4a7d2f998',
  pinataSecretApiKey:
    '5988caf8173c5cc986978b9bfd48060622830025ce80cc167f3c58d56ae29dbf',
});

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

const create = async (req, res, next) => {
  try {
    upload2.single('nftFile')(req, res, async (error) => {
      console.log(req.file.originalname);

      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDlCMzlDMDMxQUQ2OTg0Mzk4RTQ1NzQ0YTk2YzNkMzc0ZDU0YURENTAiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2Njk3MzAwNDk1NTYsIm5hbWUiOiJtYXJrZXRwbGFjZSJ9.io0FvRpm6l-nbxxRGDMZii4s03ErdxJbGaC3yEHXzFM';

      if (!token) {
        console.error(
          'A token is needed. You can create one on https://web3.storage'
        );
        return;
      }
      const storage = new Web3Storage({ token });
      const files = await getFilesFromPath(req.file.path);
      const cid = await storage.put(files);
      console.log('Content added with CID:', cid);
      console.log(`http://${cid}.ipfs.w3s.link/${req.file.filename}`);
      const nft = new NFT({
        nTitle: req.body.nTitle,
        nCollection:
          req.body.nCollection && req.body.nCollection != undefined
            ? req.body.nCollection
            : '',
        nHash: cid,
        nOwnedBy: [], // setting ownedby for first time empty
        nQuantity: req.body.nQuantity,
        nCollaborator: req.body.nCollaborator.split(','),
        nCollaboratorPercentage: req.body.nCollaboratorPercentage
          .split(',')
          .map((percentage) => +percentage),
        nRoyaltyPercentage: req.body.nRoyaltyPercentage,
        nDescription: req.body.nDescription,
        nCreater: req.userId,
        nTokenID: req.body.nTokenID,
        nType: req.body.nType,
        nLockedContent: req.body.lockedContent,
        nNftImage: req.file.filename,
        nLazyMintingStatus: req.body.nLazyMintingStatus,
      });
      nft.nOwnedBy.push({
        address: req.body.nCreatorAddress,
        quantity: req.body.nQuantity,
      });
      await nft.save().then(async (result) => {
        const collection = await Collection.findOne({
          sContractAddress: req.body.nCollection,
        });
        const nextId = collection.getNextId();
        collection.nextId = nextId;
        collection.save();
        console.log(result);
        return res.send({ message: 'NFT Data', result });
      });
    });
  } catch (error) {
    res.send(error);
  }
};

const etNFTOrder = async (req, res) => {
  try {
    const aNft = await NFT.findById(req.body.nftId);
    if (!aNft) return res.send('NFT Not found');

    aNft.nOrders.push(req.body.orderId);

    await aNft.save();
    return res.send(aNft);
  } catch (error) {
    res.send(error);
  }
};
const myNFTList = async (req, res) => {
  try {
    if (!req.body.userId) return res.send('unauthorized user');
    const nLimit = parseInt(req.body.length);
    const nOffset = parseInt(req.body.start);
    let oTypeQuery = {};
    let oSellingTypeQuery = {};
    const oSortingOrder = {};
    console.log(req.body);
    if (req.body.eType[0] != 'All' && req.body.eType[0] != '') {
      oTypeQuery = {
        $or: [],
      };
      req.body.eType.forEach((element) => {
        oTypeQuery.$or.push({
          eType: element,
        });
      });
      let oCollectionQuery = {};
      if (req.body.sCollection != 'All' && req.body.sCollection != '') {
        oCollectionQuery = {
          sCollection: req.body.sCollection,
        };
      }
      if (req.body.sSellingType != '') {
        oSellingTypeQuery = {
          eAuctionType: req.body.sSellingType,
        };
      }
      if (req.body.sSortingType == 'Recently Added') {
        oSortingOrder.sCreated = -1;
      } else if (req.body.sSortingType == 'Most Viewed') {
        oSortingOrder.nView = -1;
      } else if (req.body.sSortingType == 'Price Low to High') {
        oSortingOrder.nBasePrice = 1;
      } else if (req.body.sSortingType == 'Price High to Low') {
        oSortingOrder.nBasePrice = -1;
      } else {
        oSortingOrder._id = -1;
      }
      const data = await NFT.aggregate([
        {
          $match: {
            $and: [
              oTypeQuery,
              oCollectionQuery,
              oSellingTypeQuery,
              {
                $or: [
                  {
                    oCurrentOwner: mongoose.Types.ObjectId(req.userId),
                  },
                ],
              },
            ],
          },
        },
        {
          $sort: oSortingOrder,
        },
        {
          $project: {
            _id: 1,
            sName: 1,
            eType: 1,
            nBasePrice: 1,
            collectionImage: 1,
            nQuantity: 1,
            nTokenID: 1,
            oCurrentOwner: 1,
            sTransactionStatus: 1,
            eAuctionType: 1,

            sGenre: 1,
            sBpm: 1,
            skey_equalTo: 1,
            skey_harmonicTo: 1,
            track_cover: 1,

            user_likes: {
              $size: {
                $filter: {
                  input: '$user_likes',
                  as: 'user_likes',
                  cond: {
                    $eq: ['$$user_likes', mongoose.Types.ObjectId(req.userId)],
                  },
                },
              },
            },
            user_likes_size: {
              $cond: {
                if: {
                  $isArray: '$user_likes',
                },
                then: {
                  $size: '$user_likes',
                },
                else: 0,
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            sName: 1,
            eType: 1,
            nBasePrice: 1,
            collectionImage: 1,
            nQuantity: 1,
            nTokenID: 1,
            oCurrentOwner: 1,
            sTransactionStatus: 1,
            eAuctionType: 1,
            sGenre: 1,
            sBpm: 1,
            skey_equalTo: 1,
            skey_harmonicTo: 1,
            track_cover: 1,

            is_user_like: {
              $cond: {
                if: {
                  $gte: ['$user_likes', 1],
                },
                then: 'true',
                else: 'false',
              },
            },
            user_likes_size: 1,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'oCurrentOwner',
            foreignField: '_id',
            as: 'oUser',
          },
        },
        { $unwind: '$oUser' },
        {
          $facet: {
            nfts: [
              {
                $skip: +nOffset,
              },
              {
                $limit: +nLimit,
              },
            ],
            totalCount: [
              {
                $count: 'count',
              },
            ],
          },
        },
      ]);
      const iFiltered = data[0].nfts.length;
      if (data[0].totalCount[0] == undefined) {
        return res.send({
          message: 'Data',
          data: 0,
          draw: req.body.draw,
          recordsTotal: 0,
          recordsFiltered: iFiltered,
        });
      }
      return res.send({
        message: 'NFT Details',
        data: data[0].nfts,
        draw: req.body.draw,
        recordsTotal: data[0].totalCount[0].count,
        recordsFiltered: iFiltered,
      });
    }
  } catch (error) {
    res.send(error);
  }
};

const nftID = async (req, res) => {
  console.log(req.params.nNFTId);
  try {
    if (!req.params.nNFTId) return res.send('NFT Id not found');

    const aNFT = await NFT.findById(req.params.nNFTId).populate({
      path: 'nCreater',
      options: {
        limit: 1,
      },
      select: {
        sWalletAddress: 1,
        _id: 1,
        sProfilePicUrl: 1,
      },
    });
    if (!aNFT) return res.send('NFT Not Found');
    console.log('============dsfdsf', aNFT);
    return res.send(aNFT);
    // aNFT = aNFT.toObject();
    // aNFT.sCollectionDetail = {};
    // req.userId = "63737df86c3f990840e14a67";

    // aNFT.sCollectionDetail = await Collection.findOne({
    //   sName:
    //     aNFT.sCollection && aNFT.sCollection != undefined
    //       ? aNFT.sCollection
    //       : "-",
    // });
    // console.log("Collection Details", aNFT.sCollectionDetail);
    // var token = req.headers.authorization;

    // req.userId =
    //   req.userId && req.userId != undefined && req.userId != null
    //     ? req.userId
    //     : "";
    // console.log(req.userId);

    // if (token) {
    //   token = token.replace("Bearer ", "");
    //   jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    //     if (err) return res.send("error while decoding token");
    //     console.log("decodedId", decoded.id);
    //     if (decoded) req.userId = decoded.id;
    //   });

    //   console.log(aNFT.oCurrentOwner._id);
    //   if (aNFT.oCurrentOwner._id != req.userId)
    //     await NFT.findByIdAndUpdate(req.params.nNFTId, {
    //       $inc: {
    //         nView: 1,
    //       },
    //     });

    //   aNFT.loggedinUserId = req.userId;
    //   console.log("==================", aNFT.loggedinUserId);
    //   console.log("---------------------------8");

    //   if (!aNFT) {
    //     console.log("---------------------------9");

    //     return res.send("Not Found");
    //   }
    //   console.log("---------------------------10");

    //   return res.send(aNFT);
    // }
  } catch (error) {
    res.send(error);
  }
};

const nftListing = async (req, res) => {
  try {
    if (!req.userId) return res.send('unauthroized');
    const nLimit = parseInt(req.body.length);
    const nOffset = parseInt(req.body.start);
    let oTypeQuery = {};
    let oSellingTypeQuery = {};
    const oSortingOrder = {};
    console.log(req.body);
    if (req.body.eType[0] != 'All' && req.body.eType[0] != '') {
      oTypeQuery = {
        $or: [],
      };
      req.body.eType.forEach((element) => {
        oTypeQuery.$or.push({
          eType: element,
        });
      });
    }
    let oCollectionQuery = {};
    if (req.body.sCollection != 'All' && req.body.sCollection != '') {
      oCollectionQuery = {
        sCollection: req.body.sCollection,
      };
    }

    if (req.body.sSellingType != '') {
      oSellingTypeQuery = {
        eAuctionType: req.body.sSellingType,
      };
    }
    if (req.body.sSortingType == 'Recently Added') {
      oSortingOrder.sCreated = -1;
    } else if (req.body.sSortingType == 'Most Viewed') {
      oSortingOrder.nView = -1;
    } else if (req.body.sSortingType == 'Price Low to High') {
      oSortingOrder.nBasePrice = 1;
    } else if (req.body.sSortingType == 'Price High to Low') {
      oSortingOrder.nBasePrice = -1;
    } else {
      oSortingOrder._id = -1;
    }
    const data = await NFT.aggregate([
      {
        $match: {
          $and: [
            oTypeQuery,
            oCollectionQuery,
            oSellingTypeQuery,
            {
              $or: [
                {
                  oCurrentOwner: mongoose.Types.ObjectId(req.userId),
                },
              ],
            },
          ],
        },
      },
      {
        $sort: oSortingOrder,
      },
      {
        $project: {
          _id: 1,
          sName: 1,
          eType: 1,
          nBasePrice: 1,
          collectionImage: 1,
          nQuantity: 1,
          nTokenID: 1,
          oCurrentOwner: 1,
          sTransactionStatus: 1,
          eAuctionType: 1,

          sGenre: 1,
          sBpm: 1,
          skey_equalTo: 1,
          skey_harmonicTo: 1,
          track_cover: 1,

          user_likes: {
            $size: {
              $filter: {
                input: '$user_likes',
                as: 'user_likes',
                cond: {
                  $eq: ['$$user_likes', mongoose.Types.ObjectId(req.userId)],
                },
              },
            },
          },
          user_likes_size: {
            $cond: {
              if: {
                $isArray: '$user_likes',
              },
              then: {
                $size: '$user_likes',
              },
              else: 0,
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          sName: 1,
          eType: 1,
          nBasePrice: 1,
          collectionImage: 1,
          nQuantity: 1,
          nTokenID: 1,
          oCurrentOwner: 1,
          sTransactionStatus: 1,
          eAuctionType: 1,
          sGenre: 1,
          sBpm: 1,
          skey_equalTo: 1,
          skey_harmonicTo: 1,
          track_cover: 1,

          is_user_like: {
            $cond: {
              if: {
                $gte: ['$user_likes', 1],
              },
              then: 'true',
              else: 'false',
            },
          },
          user_likes_size: 1,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'oCurrentOwner',
          foreignField: '_id',
          as: 'oUser',
        },
      },
      { $unwind: '$oUser' },
      {
        $facet: {
          nfts: [
            {
              $skip: +nOffset,
            },
            {
              $limit: +nLimit,
            },
          ],
          totalCount: [
            {
              $count: 'count',
            },
          ],
        },
      },
    ]);
    const iFiltered = data[0].nfts.length;
    if (data[0].totalCount[0] == undefined) {
      return res.send({
        message: 'Data',
        data: 0,
        draw: req.body.draw,
        recordsTotal: 0,
        recordsFiltered: iFiltered,
      });
    }
    return res.send({
      message: 'NFT Details',
      data: data[0].nfts,
      draw: req.body.draw,
      recordsTotal: data[0].totalCount[0].count,
      recordsFiltered: iFiltered,
    });
  } catch {
    res.send(error);
  }
};

const getNFTOwner = async (req, res) => {
  try {
    console.log('user id && NFTId -->', req.userId, req.params.nNFTId);
    let nftOwner = {};

    nftOwner = await NFTowners.findOne({
      nftId: req.params.nNFTId,
      oCurrentOwner: req.userId,
    });
    if (!nftOwner) {
      nftOwner = await NFTowners.findOne(
        { nftId: req.params.nNFTId },
        {},
        { sort: { sCreated: -1 } }
      );
      console.log('nft owner is-->', nftOwner);
      return res.send({ message: 'success', nftOwner });
    }
    if (nftOwner.oCurrentOwner) {
      users = await User.findOne(nftOwner.oCurrentOwner);
      nftOwner.oCurrentOwner = users;
    }
    console.log('nft owner is-->', nftOwner);
    return res.send({ message: 'success', nftOwner });
  } catch (error) {
    res.send(error);
  }
};

const getAllNFTOwner = async (req, res) => {
  try {
    console.log('All Nft Called -->', req.params.nNFTId);

    let nftOwner = {};

    nftOwner = await NFTowners.find({ nftId: req.params.nNFTId });
    return res.send({ message: 'NFT Owner', nftOwner });
  } catch (error) {
    return res.send(error);
  }
};
const deleteNFT = async (req, res) => {
  try {
    if (!req.params.nNFTId) return res.send('NFT ID not Found');
    await NFT.findByIdAndDelete(req.params.nNFTId);
    return res.send('NFT Deleted');
  } catch (error) {
    return res.send(error);
  }
};
const updateBasePrice = async (req, res) => {
  try {
    if (!req.userId) return res.send('unauthorized');
    if (!req.params.nNFTId) return res.send('NFT ID not Found');
    if (!req.body.nBasePrice) return res.send('Base Price Not Found');
    if (
      isNaN(req.body.nBasePrice) ||
      parseFloat(req.body.nBasePrice) <= 0 ||
      parseFloat(req.body.nBasePrice) <= 0.000001
    ) {
      return res.send('Invalid base price');
    }
    const oNFT = await NFT.findById(req.body.nNFTId);

    if (!oNFT) return res.send('NFT Not Found');
    if (oNFT.oCurrentOwner != req.userId)
      return res.send('Only NFT Owner can set base Price');

    const BIdsExist = await Bid.find({
      oNFTId: mongoose.Types.ObjectId(req.body.nNFTId),
      sTransactionStatus: 1,
      eBidStatus: 'Bid',
    });
    if (BIdsExist && BIdsExist != undefined && BIdsExist.length) {
      return res.send('Please Cancel Active bids on this NFT.');
    }
    NFT.findByIdAndUpdate(
      req.body.nNFTId,
      {
        nBasePrice: req.body.nBasePrice,
      },
      (err, nft) => {
        if (err) return res.send('sever Error');
        if (!nft) return res.send('NFT not found');

        return res.send('Price is updated');
      }
    );
  } catch (error) {
    return res.send(error);
  }
};
const setNFTOrder = async (req, res) => {
  try {
    const aNft = await NFT.findById(req.body.nftId);
    if (!aNft) {
      return res.send('NFT Not Found');
    }

    aNft.nOrders.push(req.body.orderId);
    await aNft.save();

    return res.send({ message: 'nfts List', aNft });
  } catch (error) {
    res.send(error);
  }
};
const getOnSaleItems = async (req, res) => {
  try {
    const data = [];
    console.log('data===>', data);
    const OrderSearchArray = [];
    const { sSellingType } = req.body;
    const { sTextsearch } = req.body;
    const { itemType } = req.body;
    const page = parseInt(req.body.page);
    const limit = parseInt(req.body.limit);
    console.log(
      'reciving payload===========>',
      sSellingType,
      itemType,
      page,
      limit
    );

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    OrderSearchArray.oStatus = 1;
    if (sSellingType !== '') {
      OrderSearchArray.oType = sSellingType;
    }
    const OrderSearchObj = { ...OrderSearchArray };
    const OrderIdsss = await Order.distinct('oNftId', OrderSearchObj);
    console.log('Order Ids======', OrderIdsss);

    const NFTSearchArray = [];
    NFTSearchArray._id = { $in: OrderIdsss.map(String) };
    console.log('NFTSearchArray Array======', NFTSearchArray);
    if (sTextsearch !== '') {
      NFTSearchArray.nTitle = {
        $regex: new RegExp(sTextsearch),
        $options: '<options>',
      };
    }
    if (itemType !== '') {
      NFTSearchArray.nType = itemType;
    }
    const NFTSearchObj = { ...NFTSearchArray };
    console.log('NFT OBj Search========', NFTSearchObj);
    const results = {};
    if (endIndex < (await NFT.countDocuments(NFTSearchObj).exec())) {
      results.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit,
      };
    }
    await NFT.find(NFTSearchObj)
      .sort({ nCreated: -1 })
      .select({
        nTitle: 1,
        nCollection: 1,
        nHash: 1,
        nType: 1,
        nUser_likes: 1,
        nNftImage: 1,
        nLazyMintingStatus: 1,
      })
      .populate({
        path: 'nCreater',
        options: {
          limit: 1,
        },
        select: {
          _id: 1,
          sProfilePicUrl: 1,
          sWalletAddress: 1,
        },
      })
      .populate({
        path: 'nOrders',
        options: {
          limit: 1,
        },
        select: {
          oPrice: 1,
          oType: 1,
          oValidUpto: 1,
          oStatus: 1,
          _id: 0,
        },
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
    results.count = await NFT.countDocuments(NFTSearchObj).exec();
    results.results = data[0];
    res.header('Access-Control-Max-Age', 600);
    return res.send({ message: 'Order List', results });
  } catch (error) {
    res.send(error);
  }
};
const toggleSellingType = async (req, res) => {
  try {
    if (!req.userId) return res.send('unauthrized user');
    if (!req.body.nNFTId) return res.send('ID Not Found');
    if (!req.body.sSellingType) return res.send('Selling Type Not Found');

    const oNFT = await NFT.findById(req.body.nNFTId);

    if (!oNFT) return res.send('NFT Not Found');
    if (oNFT.oCurrentOwner != req.userId)
      return res.send('Only NFT Owner Can Set Selling Type');

    const BIdsExist = await Bid.find({
      oNFTId: mongoose.Types.ObjectId(req.body.nNFTId),
      sTransactionStatus: 1,
      eBidStatus: 'Bid',
    });

    if (BIdsExist && BIdsExist != undefined && BIdsExist.length) {
      return res.send('Please Cancel Active bids on this NFT.');
    }
    const updObj = {
      eAuctionType: req.body.sSellingType,
    };
    if (req.body.auction_end_date && req.body.auction_end_date != undefined) {
      updObj.auction_end_date = req.body.auction_end_date;
    }
    NFT.findByIdAndUpdate(req.body.nNFTId, updObj, (err, nft) => {
      if (err) return res.send('Server Error');
      if (!nft) return res.send('NFT Not Found');

      return res.send('NFT Details');
    });
  } catch (error) {
    res.send(error);
  }
};
const uploadImage = async (req, res) => {
  try {
    allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    errAllowed = 'JPG, JPEG, PNG,GIF';
    uploadBanner.single('nftFile')(req, res, (error) => {
      if (error) {
        // instanceof multer.MulterError
        fs.unlinkSync(req.file.path);
        return res.send('Multer Error');
      }
      if (!req.file) {
        fs.unlinkSync(req.file.path);
        return res.send('File Not Found');
      }
      const oOptions = {
        pinataMetadata: {
          name: req.file.originalname,
        },
        pinataOptions: {
          cidVersion: 0,
        },
      };
      const readableStreamForFile = fs.createReadStream(req.file.path);
      const testFile = fs.readFileSync(req.file.path);
      // Creating buffer for ipfs function to add file to the system
      const testBuffer = new Buffer(testFile);
      try {
        pinata
          .pinFileToIPFS(readableStreamForFile, oOptions)
          .then(async (result) => {
            fs.unlinkSync(req.file.path);
            return res.send({
              message: Collection,
              track_cover: result.IpfsHash,
            });
          })
          .catch((err) =>
            // handle error here
            res.send(err)
          );
      } catch {
        return res.send(err);
      }
    });
  } catch (error) {
    res.send(error);
  }
};

const getAllNFTs = async (req, res) => {
  let data = [];
  try {
    const aNft = await NFT.find({})
      .select({
        nTitle: 1,
        nCollection: 1,
        nHash: 1,
        nLazyMintingStatus: 1,
        nNftImage: 1,
      })
      .populate({
        path: 'nOrders',
        options: {
          limit: 1,
        },
        select: {
          oPrice: 1,
          oType: 1,
          oValidUpto: 1,
          auction_end_date: 1,
          oStatus: 1,
          _id: 0,
        },
      })
      .populate({
        path: 'nCreater',
        options: {
          limit: 1,
        },
        select: {
          _id: 0,
        },
      })
      .limit(req.body.limit)
      .skip(req.body.startIndex)
      .exec()
      .then((res) => {
        data.push(res);
      })
      .catch((e) => {
        console.log('Error', e);
      });

    return res.send({ message: 'NFT List', data });
  } catch (error) {
    return res.send(error);
  }
};
const getOwnedNFTList = async (req, res) => {
  try {
    const data = [];
    console.log('req', req.body);
    // sortKey is the column
    const sortKey = req.body.sortKey ? req.body.sortKey : '';

    // sortType will let you choose from ASC 1 or DESC -1
    const sortType = req.body.sortType ? req.body.sortType : -1;
    const sortObject = {};
    const stype = sortKey;
    const sdir = sortType;
    sortObject[stype] = sdir;
    const page = parseInt(req.body.page);
    const limit = parseInt(req.body.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};
    if (req.body.searchType === 'owned') {
      if (
        endIndex <
        (await NFT.countDocuments({
          nOwnedBy: {
            $elemMatch: {
              address: req.body.userWalletAddress,
              quantity: { $gt: 0 },
            },
          },
        }).exec())
      ) {
        results.next = {
          page: page + 1,
          limit,
        };
      }
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit,
        };
      }
      await NFT.find({
        nOwnedBy: {
          $elemMatch: {
            address: req.body.userWalletAddress,
            quantity: { $gt: 0 },
          },
        },
      })
        .select({
          nTitle: 1,
          nCollection: 1,
          nHash: 1,
          nUser_likes: 1,
          nNftImage: 1,
          nLazyMintingStatus: 1,
        })
        .populate({
          path: 'nOrders',
          options: {
            limit: 1,
          },
          select: {
            oPrice: 1,
            oType: 1,
            oValidUpto: 1,
            auction_end_date: 1,
            oStatus: 1,
            _id: 0,
          },
        })
        .populate({
          path: 'nCreater',
          options: {
            limit: 1,
          },
          select: {
            _id: 1,
            sProfilePicUrl: 1,
            sWalletAddress: 1,
          },
        })
        .limit(limit)
        .skip(startIndex)
        .exec()
        .then((res) => {
          console.log('dataa', res);
          data.push(res);
        })
        .catch((e) => {
          console.log('Error', e);
        }); // console.log("ress", resust);
      results.count = await NFT.countDocuments({
        nOwnedBy: {
          $elemMatch: {
            address: req.body.userWalletAddress,
            quantity: { $gt: 0 },
          },
        },
      }).exec();
    } else {
      if (
        endIndex <
        (await NFT.countDocuments({
          nCreater: { $in: [mongoose.Types.ObjectId(req.body.userId)] },
        }).exec())
      ) {
        results.next = {
          page: page + 1,
          limit,
        };
      }
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit,
        };
      }
      await NFT.find({
        nCreater: { $in: [mongoose.Types.ObjectId(req.body.userId)] },
      })
        .select({
          nTitle: 1,
          nCollection: 1,
          nHash: 1,
          nUser_likes: 1,
          nNftImage: 1,
        })
        .populate({
          path: 'nOrders',
          options: {
            limit: 1,
          },
          select: {
            oPrice: 1,
            oType: 1,
            oValidUpto: 1,
            auction_end_date: 1,
            oStatus: 1,
            _id: 0,
          },
        })
        .populate({
          path: 'nCreater',
          options: {
            limit: 1,
          },
          select: {
            _id: 1,
            sProfilePicUrl: 1,
            sWalletAddress: 1,
          },
        })
        .limit(limit)
        .skip(startIndex)
        .exec()
        .then((res) => {
          console.log('dataa', res);
          data.push(res);
        })
        .catch((e) => {
          console.log('Error', e);
        });
      // console.log("ress", resust);
      results.count = await NFT.countDocuments({
        nCreater: { $in: [mongoose.Types.ObjectId(req.body.userId)] },
      }).exec();
    }
    results.results = data;

    return res.send({ message: 'NFTs List', results });
  } catch (error) {
    res.send(error);
  }
};

const getUserOnSaleNfts = async (req, res) => {
  try {
    console.log('req', req.body);
    const data = [];

    const query = {};
    const orderQuery = {};

    orderQuery.oSeller = mongoose.Types.ObjectId(req.body.userId);
    orderQuery.oStatus = 1; // we are getting only active orders

    if (req.body.hasOwnProperty('search')) {
      for (var key in req.body.search) {
        // could also be req.query and req.params
        req.body.search[key] !== ''
          ? (query[key] = req.body.search[key])
          : null;
      }
    }

    if (req.body.hasOwnProperty('searchOrder')) {
      for (var key in req.body.searchOrder) {
        // could also be req.query and req.params
        req.body.searchOrder[key] !== ''
          ? (orderQuery[key] = req.body.searchOrder[key])
          : null;
      }
    }

    console.log('orderQuery', orderQuery);
    // select unique NFTids for status 1 and userId supplied
    const OrderIdsss = await Order.distinct('oNftId', orderQuery);
    console.log('order idss', OrderIdsss);
    // return if no active orders found
    if (OrderIdsss.length < 1) return res.send('Not Found');

    // set nftQuery
    query._id = { $in: OrderIdsss };

    // sortKey is the column
    const sortKey = req.body.sortKey ? req.body.sortKey : '';

    // sortType will let you choose from ASC 1 or DESC -1
    const sortType = req.body.sortType ? req.body.sortType : -1;

    const sortObject = {};
    const stype = sortKey;
    const sdir = sortType;
    sortObject[stype] = sdir;

    const page = parseInt(req.body.page);
    const limit = parseInt(req.body.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    if (
      endIndex < (await NFT.countDocuments({ _id: { $in: OrderIdsss } }).exec())
    ) {
      results.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit,
      };
    }

    await NFT.find({ _id: { $in: OrderIdsss } })
      .select({
        nTitle: 1,
        nCollection: 1,
        nHash: 1,
        nType: 1,
        nUser_likes: 1,
        nNftImage: 1,
        nLazyMintingStatus: 1,
      })
      .populate({
        path: 'nOrders',
        options: {
          limit: 1,
        },
        select: {
          oPrice: 1,
          oType: 1,
          oValidUpto: 1,
          auction_end_date: 1,
          oStatus: 1,
          _id: 0,
        },
      })
      .populate({
        path: 'nCreater',
        options: {
          limit: 1,
        },
        select: {
          _id: 1,
          sProfilePicUrl: 1,
          sWalletAddress: 1,
        },
      })
      .limit(limit)
      .skip(startIndex)
      .exec()
      .then((res) => {
        data.push(res);
      })
      .catch((e) => {
        console.log('Error', e);
      });

    results.count = await NFT.countDocuments({
      _id: { $in: OrderIdsss },
    }).exec();
    results.results = data;

    return res.send({ message: 'NFTs List Liked By User', results });
  } catch (error) {
    console.log('Error:', error);
    return res.send(error);
  }
};

const transferNfts = async (req, res) => {
  // deduct previous owner
  console.log('req', req.body);
  try {
    if (!req.userId) return res.send('Unauthorized');

    const _NFT = await NFT.findOne({
      _id: mongoose.Types.ObjectId(req.body.nftId),
      'nOwnedBy.address': req.body.sender,
    }).select('nOwnedBy -_id');

    console.log('_NFT-------->', _NFT);
    let currentQty = _NFT.nOwnedBy.find(
      (o) => o.address === req.body.sender.toLowerCase()
    ).quantity;
    let boughtQty = parseInt(req.body.qty);
    const leftQty = currentQty - boughtQty;
    if (leftQty < 1) {
      await NFT.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(req.body.nftId) },
        {
          $pull: {
            nOwnedBy: { address: req.body.sender },
          },
        }
      ).catch((e) => {
        console.log('Error1', e.message);
      });
    } else {
      await NFT.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(req.body.nftId),
          'nOwnedBy.address': req.body.sender,
        },
        {
          $set: {
            'nOwnedBy.$.quantity': parseInt(leftQty),
          },
        }
      ).catch((e) => {
        console.log('Error2', e.message);
      });
    }

    // Credit the buyer
    console.log('Crediting Buyer');

    const subDocId = await NFT.exists({
      _id: mongoose.Types.ObjectId(req.body.nftId),
      'nOwnedBy.address': req.body.receiver,
    });
    if (subDocId) {
      console.log('Subdocument Id', subDocId);

      const _NFTB = await NFT.findOne({
        _id: mongoose.Types.ObjectId(req.body.nftId),
        'nOwnedBy.address': req.body.receiver,
      }).select('nOwnedBy -_id');
      console.log('_NFTB-------->', _NFTB);
      console.log(
        'Quantity found for receiver',
        _NFTB.nOwnedBy.find(
          (o) => o.address === req.body.receiver.toLowerCase()
        ).quantity
      );
      currentQty = _NFTB.nOwnedBy.find(
        (o) => o.address === req.body.receiver.toLowerCase()
      ).quantity
        ? parseInt(
            _NFTB.nOwnedBy.find(
              (o) => o.address === req.body.receiver.toLowerCase()
            ).quantity
          )
        : 0;
      boughtQty = req.body.qty;
      const ownedQty = currentQty + boughtQty;

      await NFT.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(req.body.nftId),
          'nOwnedBy.address': req.body.receiver,
        },
        {
          $set: {
            'nOwnedBy.$.quantity': parseInt(ownedQty),
          },
        },
        { upsert: true, runValidators: true }
      ).catch((e) => {
        console.log('Error1', e.message);
      });
    } else {
      console.log('Subdocument Id not found');
      const dataToadd = {
        address: req.body.receiver,
        quantity: parseInt(req.body.qty),
      };
      await NFT.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(req.body.nftId) },
        { $addToSet: { nOwnedBy: dataToadd } },
        { upsert: true }
      );
      console.log("wasn't there but added");
    }
    return res.send('NFT updated');
  } catch (e) {
    console.log('errr', e);
    return res.send(e);
  }
};
const getSearchedNft = async (req, res) => {
  try {
    const data = [];
    const setConditions = req.body.conditions;

    // sortKey is the column
    const sortKey = req.body.sortKey ? req.body.sortKey : '';

    // sortType will let you choose from ASC 1 or DESC -1
    const sortType = req.body.sortType ? req.body.sortType : -1;

    const sortObject = {};
    const stype = sortKey;
    const sdir = sortType;
    sortObject[stype] = sdir;

    const page = parseInt(req.body.page);
    const limit = parseInt(req.body.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};
    const OrderIdsss = await Order.distinct('oNftId', setConditions);

    if (
      endIndex <
      (await NFT.countDocuments({
        nTitle: { $regex: req.body.sTextsearch, $options: 'i' },
        _id: { $in: OrderIdsss.map(String) },
      }).exec())
    ) {
      results.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit,
      };
    }

    await NFT.find({
      nTitle: { $regex: req.body.sTextsearch, $options: 'i' },
      _id: { $in: OrderIdsss.map(String) },
    })
      .select({
        nTitle: 1,
        nCollection: 1,
        nHash: 1,
        nType: 1,
        nUser_likes: 1,
        nNftImage: 1,
        nLazyMintingStatus: 1,
      })
      .populate({
        path: 'nOrders',
        options: {
          limit: 1,
        },
        select: {
          oPrice: 1,
          oType: 1,
          auction_end_date: 1,
          oValidUpto: 1,
          oStatus: 1,
          _id: 0,
        },
      })
      .populate({
        path: 'nCreater',
        options: {
          limit: 1,
        },
        select: {
          _id: 0,
        },
      })
      .limit(limit)
      .skip(startIndex)
      .exec()
      .then((res) => {
        data.push(res);
        results.count = res.length;
      })
      .catch((e) => {
        console.log('Error', e);
      });

    results.count = await NFT.countDocuments({
      nTitle: { $regex: req.body.sTextsearch, $options: 'i' },
      _id: { $in: OrderIdsss.map(String) },
    }).exec();
    results.results = data;

    return res.send({ message: 'NFTs List', results });
  } catch (error) {
    console.log('Error:', error);
    return res.send(error);
  }
};
const updateNFTDeatils = async (req, res) => {
  try {
    console.log(req.body);
    if (!req.body.nftId) return res.send('NFT Not Found');
    await NFT.findByIdAndUpdate(req.body.nftId, { nTitle: 'Test1' }).then(
      (results) => {
        res.send(results);
      }
    );
  } catch (error) {
    res.send(error);
  }
};
const getHotCollection = async (req, res) => {
  try {
    const data = [];
    let setConditions = {};
    const { sTextsearch } = req.body;
    const { erc721 } = req.body;

    if (req.body.conditions) {
      setConditions = req.body.conditions;
    }

    // sortKey is the column
    const sortKey = req.body.sortKey ? req.body.sortKey : '';

    // sortType will let you choose from ASC 1 or DESC -1
    const sortType = req.body.sortType ? req.body.sortType : -1;

    const sortObject = {};
    const stype = sortKey;
    const sdir = sortType;
    sortObject[stype] = sdir;

    const CollectionSearchArray = [];
    if (sTextsearch !== '') {
      CollectionSearchArray.sName = {
        $regex: new RegExp(sTextsearch),
        $options: '<options>',
      };
    }

    if (erc721 !== '' && erc721) {
      CollectionSearchArray.erc721 = true;
    }
    if (erc721 !== '' && erc721 === false) {
      CollectionSearchArray.erc721 = false;
    }
    const CollectionSearchObj = { ...CollectionSearchArray };

    const page = parseInt(req.body.page);
    const limit = parseInt(req.body.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    if (
      endIndex < (await Collection.countDocuments(CollectionSearchObj).exec())
    ) {
      results.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit,
      };
    }

    const aCollections = await Collection.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'oCreatedBy',
          foreignField: '_id',
          as: 'oUser',
        },
      },
      {
        $sort: {
          sCreated: req.body.sortType,
        },
      },
      { $match: CollectionSearchObj },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
    ]);

    results.results = aCollections;
    results.count = await Collection.countDocuments(CollectionSearchObj).exec();
    console.log(data);
    res.header('Access-Control-Max-Age', 600);
    return res.send({ message: 'Collections List', results });
  } catch (error) {
    res.send(error);
  }
};

export {
  create,
  myNFTList,
  nftID,
  nftListing,
  getNFTOwner,
  getAllNFTOwner,
  deleteNFT,
  updateBasePrice,
  setNFTOrder,
  getOnSaleItems,
  toggleSellingType,
  uploadImage,
  getAllNFTs,
  getOwnedNFTList,
  getHotCollection,
  updateNFTDeatils,
  getSearchedNft,
  transferNfts,
  getUserOnSaleNfts,
};
