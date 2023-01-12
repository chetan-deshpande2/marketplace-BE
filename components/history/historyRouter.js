import express from 'express';
import { insertHistory, fetchHistory,fetchListedNFTs } from './historyController.js';

const router = express.Router();

router.post('/insert', insertHistory);
router.post('/fetchHistory', fetchHistory);
router.get("/fetchListedNFTs",fetchListedNFTs)
export default router;
