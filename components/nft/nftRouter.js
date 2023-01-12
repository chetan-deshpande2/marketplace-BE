import express from 'express';
import {
  create,
  myNFTList,
  nftListing,
  nftID,
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
  getUserOnSaleNfts,
  transferNfts,
  getSearchedNft,
  updateNFTDeatils,
  getHotCollection,viewAdminNfts
} from './nftController.js';
import {
  verifyToken,
  verifyWithoutToken,
  proceedWithoutToken,
} from '../../middleware/middleware.js';

const router = express.Router();

router.post('/create', create);

router.post('/myNFTList', verifyWithoutToken, myNFTList);
router.get('/viewnft/:nNFTId', nftID);
router.post('/nftListing', verifyWithoutToken, nftListing);

router.get('/viewnftOwner/:nNFTId', verifyWithoutToken, getNFTOwner);
router.get('/getAllnftOwner/:nNFTId', verifyWithoutToken, getAllNFTOwner);
router.get('/deleteNFT/:nNFTId', verifyToken, deleteNFT);

router.put('/updateBasePrice', verifyToken, updateBasePrice);

router.put('/setNFTOrder', verifyToken, setNFTOrder);
router.post('/updateNFTDeatils', updateNFTDeatils);

router.post('/getOnSaleItems', verifyWithoutToken, getOnSaleItems);

router.put('/toggleSellingType', verifyToken, toggleSellingType);
router.post('/uploadImage', verifyToken, uploadImage);

router.post('/getAllNfts', getAllNFTs);
router.post('/getAdminNfts',viewAdminNfts)
router.post('/getOwnedNFTList', getOwnedNFTList);

router.post('/getUserOnSaleNfts', getUserOnSaleNfts);
router.put('/transferNfts', verifyToken, transferNfts);
router.post('/getSearchedNft', getSearchedNft);
router.post('/getHotCollections', getHotCollection);

// router.post('/createNFT', createNFT);

// router.post('/like', verifyToken, nftController.likeNFT);
// router.post('/getUserLikedNfts', nftController.getUserLikedNfts);

export default router;
