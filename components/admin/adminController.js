import fs from 'fs';
import multer from 'multer';
import User from '../user/userModel.js';
import NFT from '../nft/nftModel.js';
import Bid from '../bid/bidModel.js';

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, process.cwd() + '/nft');
  },
  filename: (req, file, callback) => {
    callback(null, new Date().getTime() + '_' + file.originalname);
  },
});

let oMulterObj = {
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15mb
  },
};

const users = async (req, res, next) => {
  try {
    // Per page limit
    var nLimit = parseInt(req.body.length);
    // From where to start
    var nOffset = parseInt(req.body.start);

    // Get total number of records
    let nTotalUsers = await User.countDocuments({
      sRole: {
        $ne: 'admin',
      },
    });

    var oSearchData = {
      $or: [],
    };

    if (req.body.search.value != '') {
      var re = new RegExp(`.*${req.body.search.value}.*`, 'i');

      oSearchData['$or'].push({
        sUserName: re,
      });
    }

    if (!oSearchData['$or'].length) {
      delete oSearchData['$or'];
    }

    let oSortingOrder = {};
    oSortingOrder[req.body.columns[parseInt(req.body.order[0].column)].data] =
      req.body.order[0].dir == 'asc' ? 1 : -1;

    let aUsers = await User.aggregate([
      {
        $sort: oSortingOrder,
      },
      {
        $match: {
          $and: [
            {
              sRole: {
                $eq: 'user',
              },
            },
            oSearchData,
          ],
        },
      },
      {
        $project: {
          sUserName: 1,
          sWalletAddress: 1,
          sStatus: 1,
        },
      },
      {
        $limit: nOffset + nLimit,
      },
      {
        $skip: nOffset,
      },
    ]);

    let nNumberOfRecordsInSearch = await User.aggregate([
      {
        $match: {
          $and: [
            {
              sRole: {
                $eq: 'user',
              },
            },
            oSearchData,
          ],
        },
      },
    ]);

    res.send('sucessfully added user', {
      data: aUsers,
      draw: req.body.draw,
      recordsTotal: nTotalUsers,
      recordsFiltered: nNumberOfRecordsInSearch.length,
    });
  } catch (error) {
    res.send(error);
  }
};

const getDashboardData = async (req, res) => {
  try {
    if (!req.userId) return res.send('unauthorized');
    let nTotalRegisterUsers = 0;

    nTotalRegisterUsers = await User.collection.countDocuments({
      sRole: 'user',
    });

    let data = await User.aggregate([
      {
        $match: {
          sRole: 'user',
        },
      },
      {
        $group: {
          _id: {
            day: {
              $dayOfMonth: '$sCreated',
            },
            month: {
              $month: '$sCreated',
            },
            year: {
              $year: '$sCreated',
            },
          },
          count: {
            $sum: 1,
          },
          date: {
            $first: '$sCreated',
          },
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
    ]);

    return res.send({ message: 'DashBard Data', nTotalRegisterUsers });

    // let aFixedSaleNFTsCount = await NFT.aggregate([
    //   {
    //     $match: {
    //       eAuctionType: 'Fixed Sale',
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: 'Fixed Sale',
    //       count: {
    //         $sum: 1,
    //       },
    //     },
    //   },
    // ]);
    // console.log(aFixedSaleNFTsCount);

    //     let aAuctionNFTsCount = await NFT.aggregate([
    //       {
    //         $match: {
    //           eAuctionType: 'Auction',
    //         },
    //       },
    //       {
    //         $group: {
    //           _id: 'Auction',
    //           count: {
    //             $sum: 1,
    //           },
    //         },
    //       },
    //     ]);
    // console.log(aAuctionNFTsCount);
    //     let aSoldNFTsCount = await Bid.aggregate([
    //       {
    //         $match: {
    //           $or: [
    //             {
    //               eBidStatus: 'Sold',
    //             },
    //             {
    //               eBidStatus: 'Accepted',
    //             },
    //           ],
    //         },
    //       },
    //       {
    //         $group: {
    //           _id: 'Sold',
    //           count: {
    //             $sum: 1,
    //           },
    //         },
    //       },
    //     ]);
    // console.log(aSoldNFTsCount);
    // return res.send({
    //   message: 'Dashboard Data',
    //   nTotalRegisterUsers,
    //   data,
    //   nFixedSaleNFTsCount: !aFixedSaleNFTsCount[0]
    //     ? 0
    //     : aFixedSaleNFTsCount[0].count,
    //   nAuctionNFTsCount: !aAuctionNFTsCount[0] ? 0 : aAuctionNFTsCount[0].count,
    //   nSoldNFTsCount: !aSoldNFTsCount[0] ? 0 : aSoldNFTsCount[0].count,
    // });
  } catch (error) {
    res.send(error);
  }
};
const toggleUserStatus = async (req, res) => {
  try {
    if (!req.body.sObjectId) return res.send('Invalid Id');
    if (!req.body.sStatus) return res.send('Invalid Status');

    User.findByIdAndUpdate(
      req.body.sObjectId,
      {
        sStatus: req.body.sStatus,
      },
      (err, user) => {
        if (err) {
          console.log(err);
          return res.send('Server Error');
        }
        if (!user) return res.send('User Not Found');
        return res.send({ message: 'Updated User', user });
      }
    );
  } catch (error) {
    res.send(error);
  }
};
const nftData = async (req, res) => {
  try {
    // Per page limit
    var nLimit = parseInt(req.body.length);
    // From where to start
    var nOffset = parseInt(req.body.start);

    // Get total number of records
    let nTotalNFTs = await NFT.countDocuments();
    console.log(nTotalNFTs)

    var oSearchData = {
      $or: [],
    };

    if (req.body.search.value != '') {
      var re = new RegExp(`.*${req.body.search.value}.*`, 'i');
      oSearchData['$or'].push({
        sName: re,
      });
    }

    if (!oSearchData['$or'].length) {
      delete oSearchData['$or'];
    }

    let oSortingOrder = {};
    oSortingOrder[req.body.columns[parseInt(req.body.order[0].column)].data] =
      req.body.order[0].dir == 'asc' ? 1 : -1;

    let aNFTs = await NFT.aggregate([
      {
        $sort: oSortingOrder,
      },
      {
        $match: {
          $and: [oSearchData],
        },
      },
      {
        $limit: nOffset + nLimit,
      },
      {
        $skip: nOffset,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'oPostedBy',
          foreignField: '_id',
          as: 'oCreator',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'oCurrentOwner',
          foreignField: '_id',
          as: 'oOwner',
        },
      },
    ]);
    console.log(aNFTs)

    let nNumberOfRecordsInSearch = await NFT.aggregate([
      {
        $match: {
          $and: [oSearchData],
        },
      },
    ]);

    // If no record found
    if (!aNFTs.length) {
      return res.send( {
        message:"data Not Found",
        data: [],
        draw: req.body.draw,
        recordsTotal: nTotalNFTs,
        recordsFiltered: 0,
      });
    }

    return res.send( {
      message:"NFT Data",
      data: aNFTs,
      draw: req.body.draw,
      recordsTotal: nTotalNFTs,
      recordsFiltered: nNumberOfRecordsInSearch.length,
    });
  } catch (error) {
    res.send(error);
  }
};

export { users, getDashboardData, toggleUserStatus ,nftData};
