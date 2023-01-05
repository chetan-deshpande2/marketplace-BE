import mongoose from 'mongoose';

import Bid from './bidModel.js';
import User from '../user/userModel.js';
import NFT from '../nft/nftModel.js';
import Order from '../order/orderModel.js';

const createBidNft = async (req, res) => {
  console.log(req.body);
  try {
    if (!req.userId) return res.send('Unauthorized user');
    console.log('Checking Old Bids');
    let checkBid = await Bid.findOne({
      oBidder: mongoose.Types.ObjectId(req.userId),
      oOwner: mongoose.Types.ObjectId(req.body.oOwner),
      oNFTId: mongoose.Types.ObjectId(req.body.oNFTId),
      oOrderId: mongoose.Types.ObjectId(req.body.oOrderId),
      oBidStatus: 'Bid',
    });

    if (checkBid) {
      await Bid.findOneAndDelete(
        {
          oBidder: mongoose.Types.ObjectId(req.userId),
          oOwner: mongoose.Types.ObjectId(req.body.oOwner),
          oNFTId: mongoose.Types.ObjectId(req.body.oNFTId),
          oOrderId: mongoose.Types.ObjectId(req.body.oOrderId),
          oBidStatus: 'Bid',
        },
        function (err, bidDel) {
          if (err) {
            console.log('Error in deleting Old Bid' + err);
          } else {
            console.log('Old Bid record Deleted' + bidDel);
          }
        }
      );
    }
    const bidData = new Bid({
      oBidder: req.userId,
      oOwner: req.body.oOwner,
      oBidStatus: 'Bid',
      oBidPrice: req.body.oBidPrice,
      oNFTId: req.body.oNFTId,
      oOrderId: req.body.oOrderId,
      oBidQuantity: req.body.oBidQuantity,
      oBuyerSignature: req.body.oBuyerSignature,
      oBidDeadline: req.body.oBidDeadline,
    });
    bidData
      .save()
      .then(async (result) => {
        return res.send({ message: 'Bid Placed', result });
      })
      .catch((error) => {
        console.log('Created Bid error', error);
        return res.send('Created Bid Error');
      });
  } catch (error) {
    res.send(error);
  }
};

const updateBidNft = async (req, res) => {
  try {
    console.log('Checking Old Bids');
    let bidID = req.body.bidID;
    let CheckBid = await Bid.findById(bidID);
    if (CheckBid) {
      if (
        req.body.action == 'Delete' ||
        req.body.action == 'Cancelled' ||
        req.body.action === 'Rejected'
      ) {
        await Bid.findOneAndDelete(
          { _id: mongoose.Types.ObjectId(bidID) },
          function (err, delBid) {
            if (err) {
              console.log('Error in Deleting Bid' + err);
              return res.send(err);
            } else {
              console.log('Bid Deleted : ', delBid);
              return res.send({ message: 'Bid Cancelled', delBid });
            }
          }
        );
      } else {
        await Bid.findOneAndUpdate(
          { _id: mongoose.Types.ObjectId(bidID) },
          { oBidStatus: req.body.action },
          function (err, rejBid) {
            if (err) {
              console.log('Error in Rejecting Bid' + err);
              return res.send(err);
            } else {
              console.log('Bid Rejected : ', rejBid);
              return res.send({ message: 'Bid Rejected', rejBid });
            }
          }
        );
      }
    } else {
      res.send('Bid Not Found');
    }
  } catch (error) {
    res.send(error);
  }
};

const fetchBidNft = async (req, res) => {
  try {
    if (!req.userId) return res.send('Unauthorized Access');
    let nftID = req.body.nftID;
    let orderID = req.body.orderID;
    let buyerID = req.body.buyerID;
    let bidStatus = req.body.bidStatus;
    let oTypeQuery = {};
    let nftIDQuery = {};
    let orderIDQuery = {};
    let buyerIDQuery = {};

    let filters = [];
    if (bidStatus != 'All') {
      oTypeQuery = { bidStatus: mongoose.Types.ObjectId(bidStatus) };
    }
    if (nftID != 'All') {
      nftIDQuery = { nftID: mongoose.Types.ObjectId(nftID) };
    }
    if (orderID != 'All') {
      orderIDQuery = { orderID: mongoose.Types.ObjectId(orderID) };
    }
    if (buyerID != 'All') {
      buyerIDQuery = { bidderID: mongoose.Types.ObjectId(buyerID) };
    }

    let data = await Bid.aggregate([
      {
        $match: {
          $and: [
            { oBidQuantity: { $gte: 1 } },
            { oNFTId: mongoose.Types.ObjectId(nftID) },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          oBidder: 1,
          oOwner: 1,
          oBidStatus: 1,
          oBidPrice: 1,
          oNFTId: 1,
          oOrderId: 1,
          oBidQuantity: 1,
          oBuyerSignature: 1,
          oBidDeadline: 1,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'oBidder',
          foreignField: '_id',
          as: 'oBidder',
        },
      },
      { $unwind: '$oBidder' },
    ]);

    console.log('Datat==>>' + data.length);

    return res.send({
      message: 'Bid Details',
      data: data,
    });

    // for (let i = 0; i <= data.length - 1; i++) {
    //   console.log('=======Data======>>', data[i].oNFTId, nftID);
    //   if (data[i].oNFTId == nftID) {
    //     console.log(data[i]);

    //     return res.send({
    //       message: 'Bid Details',
    //       data: data[i],
    //     });
    //   }
    // }
  } catch (error) {
    res.send(error);
  }
};

const acceptBidNft = async (req, res) => {
  console.log(req.body);
  try {
    // if (!req.userId) return res.send('Unauthorized');
    if (!req.body.bidID) return res.send('bid is required');
    console.log('Checking Old Bids');
    let erc721 = req.body.erc721;
    let bidID = req.body.bidID;
    let status = req.body.status;
    let qty_sold = req.body.qty_sold;
    let BidData = await Bid.findById(bidID);
    // console.log(BidData);
    if (BidData) {
      let oNFTId = BidData.oNFTId;
      let orderId = BidData.oOrderId;
      let boughtQty = parseInt(BidData.oBidQuantity);
      let oBidder = BidData.oBidder;
      let BuyerData = await User.findById(oBidder);
      let oBuyer = BuyerData.sWalletAddress;
      let oOwner = BidData.oOwner;
      let OwnerData = await User.findById(oOwner);
      let oSeller = OwnerData.sWalletAddress;
      // console.log(OwnerData);
      await Order.updateOne(
        { _id: orderId },
        {
          $set: {
            oStatus: status,
            quantity_sold: qty_sold,
          },
        },
        {
          upsert: true,
        },
        (error) => {
          if (error) throw error;
        }
      );
      let _NFT = await NFT.findOne({
        _id: mongoose.Types.ObjectId(oNFTId),
      }).select('nOwnedBy -_id');

      // let _NFT = await NFT.findOne({ _id: mongoose.Types.ObjectId(oNFTId)
      // 'nOwnedBy[0].address': oSeller, });
      // console.log('_NFT-------->', _NFT);
      let data1 = await NFT.findOne({ _id: mongoose.Types.ObjectId(oNFTId) });
      let currentQty = data1.nQuantity;

      let leftQty = currentQty - boughtQty;
      if (leftQty < 1) {
        let data = await NFT.findOneAndUpdate(
          { _id: mongoose.Types.ObjectId(oNFTId) },
          {
            $pull: {
              nOwnedBy: { address: oSeller },
            },
          }
        ).catch((e) => {
          console.log('Error1', e.message);
        });
        // console.log(data);
      } else {
        await NFT.findByIdAndUpdate(
          {
            _id: mongoose.Types.ObjectId(oNFTId),
            'nOwnedBy.address': oSeller,
          },
          {
            $set: {
              'nOwnedBy.$.quantity': parseInt(leftQty),
            },
          }
        ).catch((error) => {
          console.log('error2', error);
        });
      }

      console.log('Crediting Buyer');
      let subDocId = await NFT.exists({
        _id: mongoose.Types.ObjectId(oNFTId),
        'nOwnedBy.address': oBuyer,
      });

      console.log(subDocId);
      if (subDocId) {
        console.log('Subdocument Id', subDocId);
        let _NFTB = await NFT.findOne({
          _id: mongoose.Types.ObjectId(oNFTId),
          'nOwnedBy.address': oBuyer,
        }).select('nOwnedBy -_id');
        // console.log('_NFTB-------->', _NFTB);
        // console.log(
        //   'Quantity found for buyers',
        //   _NFTB.nOwnedBy.find((o) => o.address === oBuyer.toLowerCase())
        //     .quantity
        // );
        currentQty = _NFTB.nOwnedBy.find(
          (o) => o.address === oBuyer.toLowerCase()
        ).quantity
          ? parseInt(
              _NFTB.nOwnedBy.find((o) => o.address === oBuyer.toLowerCase())
                .quantity
            )
          : 0;
        let ownedQty = currentQty + boughtQty;
        await NFT.findOneAndUpdate(
          {
            _id: mongoose.Types.ObjectId(oNFTId),
            'nOwnedBy.address': oBuyer,
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
        let dataToadd = {
          address: oBuyer,
          quantity: parseInt(boughtQty),
        };
        await NFT.findOneAndUpdate(
          { _id: mongoose.Types.ObjectId(oNFTId) },
          { $addToSet: { nOwnedBy: dataToadd } },
          { upsert: true }
        );
        console.log("wasn't there but added");
      }

      await Bid.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(bidID),
        },
        { oBidStatus: 'Accepted' },
        function (err, acceptBid) {
          if (err) {
            console.log('Error in Accepting Bid' + err);
            return res.send(err);
          } else {
            console.log('Bid Accepted : ', acceptBid);
          }
        }
      );
      if (erc721) {
        console.log('===Owner Data', oOwner, oNFTId);
        await Bid.findOneAndDelete({
          oOwner: mongoose.Types.ObjectId(oOwner),
          oNFTId: mongoose.Types.ObjectId(oNFTId),
          // oBidStatus: 'Bid',
        })
          .then(function () {
            console.log('Data deleted');
          })
          .catch(function (error) {
            console.log(error);
          });
      } else {
        let _order = await Order.findOne({
          _id: mongoose.Types.ObjectId(orderId),
        });
        let leftQty = _order.oQuantity - qty_sold;
        if (leftQty <= 0) {
          await Order.deleteOne({ _id: mongoose.Types.ObjectId(orderId) });
        }
        console.log('left qty 1155', leftQty);
        await Bid.deleteMany({
          oOwner: mongoose.Types.ObjectId(oOwner),
          oNFTId: mongoose.Types.ObjectId(oNFTId),
          oBidStatus: 'Bid',
          oBidQuantity: { $gt: leftQty },
        })
          .then(function () {
            console.log('Data deleted from 1155');
          })
          .catch(function (error) {
            console.log(error);
          });
      }
      return res.send('updated order');
    }
  } catch (error) {
    res.send(error);
  }
};

export { createBidNft, updateBidNft, fetchBidNft, acceptBidNft };
