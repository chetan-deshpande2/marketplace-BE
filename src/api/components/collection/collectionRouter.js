import express from "express";

const router = express.Router();

import {
  createCollection,
  collectionList,
  uploadCollection,
} from "./collectionController";
import NFTmiddleware from "../../middleware/middleware";

router.post(
  "/createCollection",
  NFTmiddleware.verifyWithoutToken,
  createCollection
);
router.get("/collectionList", collectionList);
router.post("/upload", NFTmiddleware.verifyWithoutToken, uploadCollection);

module.exports = router;
