import express from 'express';
import {
    createGroup,
    getAllGroups,
    getGroupById,
    updateGroup,
    deleteGroup
} from '../controllers/groupController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Groups
 *     description: Universal group management. Groups only have a name. When assigned to units, each unit specifies its own color for the group.
 */

/**
 * @swagger
 * /api/fire/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
 *     description: Create a new universal group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GroupCreateRequest'
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupResponse'
 *       400:
 *         description: Validation error or duplicate group name
 *       500:
 *         description: Server error
 */
router.post('/', createGroup);

/**
 * @swagger
 * /api/fire/groups:
 *   get:
 *     summary: Get all groups
 *     tags: [Groups]
 *     description: Retrieve all universal groups
 *     responses:
 *       200:
 *         description: List of groups
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
 *                     $ref: '#/components/schemas/Group'
 *       500:
 *         description: Server error
 */
router.get('/', getAllGroups);

/**
 * @swagger
 * /api/fire/groups/{id}:
 *   get:
 *     summary: Get group by ID
 *     tags: [Groups]
 *     description: Retrieve a specific group by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Group'
 *       400:
 *         description: Invalid group ID format
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getGroupById);

/**
 * @swagger
 * /api/fire/groups/{id}:
 *   put:
 *     summary: Update group
 *     tags: [Groups]
 *     description: Update an existing group
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Group updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GroupResponse'
 *       400:
 *         description: Invalid input data or duplicate name
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.put('/:id', updateGroup);

/**
 * @swagger
 * /api/fire/groups/{id}:
 *   delete:
 *     summary: Delete group
 *     tags: [Groups]
 *     description: Delete a group by its ID. Cannot delete if assigned to any units.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     responses:
 *       200:
 *         description: Group deleted successfully
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
 *         description: Cannot delete (group is assigned to units)
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteGroup);

export default router;

