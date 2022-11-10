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

router.post(
  "/createCollection",
  NFTmiddleware.proceedWithoutToken,
  createCollection
);
router.get("/collectionList", NFTmiddleware.verifyWithoutToken, collectionList);
router.post("/upload", NFTmiddleware.verifyWithoutToken, uploadCollection);

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
router.post("/myCollectionList", NFTmiddleware.verifyToken, userCollectionList);

router.get("/getcollections", getCollections);

router.post("/getCollectionNFT", getCollectionNFT);

router.post(
  "/getCollectionNFTOwned",
  NFTmiddleware.verifyToken,
  getCollectionNFTOwned
);
router.post("/getSearchedNft", getSearchedNFT);

router.get(
  "/updateCollectionToken/:collectionAddress",
  NFTmiddleware.verifyToken,
  updateCollectionToken
);

module.exports = router;
