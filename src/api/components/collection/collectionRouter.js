import express from "express";

const router = express.Router();

import {
  createCollection,
  collectionList,
  uploadCollection,
  getCollectionDetailsByAddress,
  getCollectionDetails,
  getCollections,
  userCollectionList,
  getCollectionNFT,
  getCollectionNFTOwned,
  getSearchedNFT,
  updateCollectionToken,
} from "./collectionController";
import NFTmiddleware from "../../middleware/middleware";

router.post("/createCollection", NFTmiddleware.verifyToken, createCollection);
router.get("/collectionList", NFTmiddleware.verifyToken, collectionList);

router.post(
  "/getCollectionDetailsById",
  NFTmiddleware.verifyWithoutToken,
  getCollectionDetails
);

router.post(
  "/getCollectionDetailsByAddress",
  NFTmiddleware.verifyWithoutToken,
  getCollectionDetailsByAddress
);
router.get("/myCollectionList", NFTmiddleware.verifyToken, userCollectionList);

router.get("/getcollections", NFTmiddleware.verifyToken, getCollections);

router.post("/getCollectionNFT", getCollectionNFT);

router.post(
  "/getCollectionNFTOwned",
  NFTmiddleware.verifyToken,
  getCollectionNFTOwned
);
router.post("/getSearchedNft", getSearchedNFT);

router.post(
  "/updateCollectionToken/:collectionAddress",
  NFTmiddleware.verifyToken,
  updateCollectionToken
);

module.exports = router;
