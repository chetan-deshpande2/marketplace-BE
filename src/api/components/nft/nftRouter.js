import express from "express";
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
} from "./nftController";
import NFTmiddleware from "../../middleware/middleware";

const router = express.Router();

router.post("/create", NFTmiddleware.verifyWithoutToken, create);
router.post("/myNFTList", myNFTList);
router.get("/viewnft/:nNFTId", NFTmiddleware.verifyWithoutToken, nftID);
router.post("/nftListing", NFTmiddleware.verifyWithoutToken, nftListing);

router.get(
  "/viewnftOwner/:nNFTId",
  NFTmiddleware.verifyWithoutToken,
  getNFTOwner
);
router.get(
  "/getAllnftOwner/:nNFTId",
  NFTmiddleware.verifyWithoutToken,
  getAllNFTOwner
);
router.get("/deleteNFT/:nNFTId", NFTmiddleware.verifyToken, deleteNFT);

router.put("/updateBasePrice", NFTmiddleware.verifyToken, updateBasePrice);

router.put("/setNFTOrder", NFTmiddleware.verifyToken, setNFTOrder);

router.post(
  "/getOnSaleItems",
  NFTmiddleware.verifyWithoutToken,
  getOnSaleItems
);

router.put("/toggleSellingType", NFTmiddleware.verifyToken, toggleSellingType);
router.post("/uploadImage", NFTmiddleware.verifyToken, uploadImage);

router.get("/getAllNfts", getAllNFTs);
router.post("/getOwnedNFTList", getOwnedNFTList);

router.post("/getUserOnSaleNfts", getUserOnSaleNfts);
router.put("/transferNfts", NFTmiddleware.verifyToken, transferNfts);
router.post("/getSearchedNft", getSearchedNft);

// router.post("/like", NFTmiddleware.verifyToken, nftController.likeNFT);
// router.post("/getUserLikedNfts", nftController.getUserLikedNfts);

module.exports = router;
