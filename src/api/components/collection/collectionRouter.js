import express from "express";

const router = express.Router();

import { createCollection, collectionList } from "./collectionController";

router.post("/createCollection", createCollection);
router.get("/collectionList", collectionList);

module.exports = router;
