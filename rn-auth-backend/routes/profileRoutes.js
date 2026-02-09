import express from 'express';
import { getProfile, updateProfile, deleteProfile } from '../controllers/profileController.js';

const router = express.Router();

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     description: Retrieve the authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *             example:
 *               _id: "507f1f77bcf86cd799439011"
 *               name: "John Doe"
 *               phone: "+1234567890"
 *               email: "john.doe@example.com"
 *               address: "123 Main St, City, Country"
 *               createdAt: "2024-01-01T00:00:00.000Z"
 *               updatedAt: "2024-01-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Token is not valid"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getProfile);

/**
 * @swagger
 * /api/profile:
 *   patch:
 *     summary: Update user profile (partial update)
 *     tags: [Profile]
 *     description: Partially update the authenticated user's profile information. Only provided fields will be updated, other fields remain unchanged.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       description: Only provide fields you want to update. All fields are optional.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProfileUpdateRequest'
 *           examples:
 *             updateName:
 *               summary: Update only name
 *               value:
 *                 name: "Jane Doe"
 *             updatePhone:
 *               summary: Update only phone
 *               value:
 *                 phone: "+233209876543"
 *             updateMultiple:
 *               summary: Update multiple fields
 *               value:
 *                 name: "Jane Doe"
 *                 phone: "+233209876543"
 *                 email: "jane@example.com"
 *                 country: "Ghana"
 *             updateAll:
 *               summary: Update all fields
 *               value:
 *                 name: "Jane Doe"
 *                 phone: "+233209876543"
 *                 email: "jane@example.com"
 *                 address: "123 Main St, Accra"
 *                 country: "Ghana"
 *                 dob: "1992-05-15"
 *                 image: "https://example.com/avatar.jpg"
 *                 ghanaPost: "GA-184-1234"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileUpdateResponse'
 *       400:
 *         description: Validation error or phone already in use
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               phoneInUse:
 *                 value:
 *                   message: "Phone number already in use"
 *               invalidPhone:
 *                 value:
 *                   message: "Invalid phone number format. Use international format (e.g., +233201234567)"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch('/', updateProfile);

/**
 * @swagger
 * /api/profile:
 *   delete:
 *     summary: Delete user profile
 *     tags: [Profile]
 *     description: Permanently delete the authenticated user's account and all associated data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile deleted successfully"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/', deleteProfile);

export default router;
