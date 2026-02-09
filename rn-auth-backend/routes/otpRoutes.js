import express from 'express';
import {
    generateOTP,
    verifyOTP,
    resendOTP,
    getOTPStatus,
    checkServiceStatus
} from '../controllers/otpController.js';

const router = express.Router();

// Generate OTP
router.post('/generate', generateOTP);

// Verify OTP
router.post('/verify', verifyOTP);

// Resend OTP
router.post('/resend', resendOTP);

// Get OTP status for a phone number
router.get('/status/:phone_number', getOTPStatus);

// Check Arkesel service status
router.get('/service-status', checkServiceStatus);

export default router;
