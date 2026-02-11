import express from 'express';
import {
    createFireSafetyTip,
    getAllFireSafetyTips,
    getFireSafetyTipById,
    updateFireSafetyTip,
    deleteFireSafetyTip
} from '../controllers/fireSafetyTipController.js';

const router = express.Router();

// Routes for fire safety tips
router.post('/', createFireSafetyTip);
router.get('/', getAllFireSafetyTips);
router.get('/:id', getFireSafetyTipById);
router.put('/:id', updateFireSafetyTip);
router.delete('/:id', deleteFireSafetyTip);

export default router;
