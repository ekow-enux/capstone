import express from 'express';
import {
    createRole,
    getAllRoles,
    getRoleById,
    updateRole,
    deleteRole
} from '../controllers/roleController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Roles
 *     description: Fire service role management (Operations Officer, Driver, Paramedic, etc.).
 */

/**
 * @swagger
 * /api/fire/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     description: Create a new fire service role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Role name
 *                 example: Operations Officer
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Validation error or duplicate role
 *       500:
 *         description: Server error
 */
router.post('/', createRole);

/**
 * @swagger
 * /api/fire/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     description: Retrieve all fire service roles
 *     responses:
 *       200:
 *         description: List of roles
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
 *                     $ref: '#/components/schemas/Role'
 *       500:
 *         description: Server error
 */
router.get('/', getAllRoles);

/**
 * @swagger
 * /api/fire/roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Roles]
 *     description: Retrieve a specific role by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Invalid role ID format
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getRoleById);

/**
 * @swagger
 * /api/fire/roles/{id}:
 *   patch:
 *     summary: Update role
 *     tags: [Roles]
 *     description: Update an existing fire service role
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
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
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', updateRole);

/**
 * @swagger
 * /api/fire/roles/{id}:
 *   delete:
 *     summary: Delete role
 *     tags: [Roles]
 *     description: Delete a role by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role deleted successfully
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
 *         description: Invalid role ID format
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteRole);

export default router;


