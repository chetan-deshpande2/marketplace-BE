import express from 'express';

const router = express.Router();

import {
  createCollection,
  collectionList,
  getCollectionDetailsByAddress,
  getCollectionDetails,
  getCollections,
  userCollectionList,
  getCollectionNFT,
  getCollectionNFTOwned,
  getSearchedNFT,
  updateCollectionToken,
} from './collectionController.js';
import {
  verifyToken,
  verifyWithoutToken,
  proceedWithoutToken,
} from '../../middleware/middleware.js';

router.post('/createCollection', verifyToken, createCollection);
router.get('/collectionList', verifyToken, collectionList);

router.post(
  '/getCollectionDetailsById',
  verifyWithoutToken,
  getCollectionDetails
);

router.post('/getCollectionDetailsByAddress', getCollectionDetailsByAddress);
router.get('/myCollectionList', verifyToken, userCollectionList);

router.get('/getcollections', verifyToken, getCollections);

router.post('/getCollectionNFT', getCollectionNFT);

router.post('/getCollectionNFTOwned', verifyToken, getCollectionNFTOwned);
router.post('/getSearchedNft', getSearchedNFT);

router.post(
  '/updateCollectionToken/:collectionAddress',
  verifyToken,
  updateCollectionToken
);

export default router;