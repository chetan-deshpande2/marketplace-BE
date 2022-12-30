import fs from 'fs';
import multer from 'multer';
import User from '../user/userModel.js';
import NFT from '../nft/nftModel.js';

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

export { users };
