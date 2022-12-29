import express from 'express';
import { insertHistory, fetchHistory } from './historyController.js';

const router = express.Router();

router.post('/insert', insertHistory);
router.post('/fetchHistory', fetchHistory);

export default router;
