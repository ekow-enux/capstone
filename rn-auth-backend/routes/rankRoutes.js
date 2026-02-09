import express from 'express';
import {
    createRank,
    getAllRanks,
    getRankById,
    updateRank,
    deleteRank
} from '../controllers/rankController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Ranks
 *     description: Fire service rank management (CFO, DO, SO, etc.) with initials support.
 */

/**
 * @swagger
 * /api/fire/ranks:
 *   post:
 *     summary: Create a new rank
 *     tags: [Ranks]
 *     description: Create a new fire service rank with name, initials, level, and description
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RankCreateRequest'
 *     responses:
 *       201:
 *         description: Rank created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RankResponse'
 *       400:
 *         description: Validation error or duplicate rank
 *       500:
 *         description: Server error
 */
router.post('/', createRank);

/**
 * @swagger
 * /api/fire/ranks:
 *   get:
 *     summary: Get all ranks
 *     tags: [Ranks]
 *     description: Retrieve all fire service ranks
 *     responses:
 *       200:
 *         description: List of ranks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Rank'
 *       500:
 *         description: Server error
 */
router.get('/', getAllRanks);

/**
 * @swagger
 * /api/fire/ranks/{id}:
 *   get:
 *     summary: Get rank by ID
 *     tags: [Ranks]
 *     description: Retrieve a specific rank by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rank ID
 *     responses:
 *       200:
 *         description: Rank details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Rank'
 *       400:
 *         description: Invalid rank ID format
 *       404:
 *         description: Rank not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getRankById);

/**
 * @swagger
 * /api/fire/ranks/{id}:
 *   patch:
 *     summary: Update rank
 *     tags: [Ranks]
 *     description: Update an existing fire service rank
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rank ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               initials:
 *                 type: string
 *               level:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rank updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RankResponse'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Rank not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', updateRank);

/**
 * @swagger
 * /api/fire/ranks/{id}:
 *   delete:
 *     summary: Delete rank
 *     tags: [Ranks]
 *     description: Delete a rank by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rank ID
 *     responses:
 *       200:
 *         description: Rank deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid rank ID format
 *       404:
 *         description: Rank not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteRank);

export default router;


