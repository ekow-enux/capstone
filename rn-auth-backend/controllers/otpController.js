import OTP from '../models/OTP.js';
import arkeselOTPService from '../services/arkeselOTPService.js';
import mongoose from 'mongoose';

// Generate OTP
export const generateOTP = async (req, res) => {
    try {
        const { phone_number, purpose = 'phone_verification', expiry = 5, length = 6, message, sender_id } = req.body;

        // Validate required fields
        if (!phone_number) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        // Check if there's an unexpired OTP for this phone number
        const existingOTP = await OTP.findOne({
            phone_number,
            is_verified: false,
            expiry_time: { $gt: new Date() }
        });

        if (existingOTP) {
            return res.status(400).json({
                success: false,
                message: 'An OTP has already been sent to this number. Please wait before requesting another.',
                data: {
                    phone_number,
                    expires_at: existingOTP.expiry_time,
                    attempts: existingOTP.attempts
                }
            });
        }

        // Generate OTP using Arkesel service
        const otpResult = await arkeselOTPService.generateOTP({
            phone_number,
            purpose,
            expiry,
            length,
            message,
            sender_id
        });

        if (!otpResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to generate OTP',
                error: otpResult.error
            });
        }

        // Calculate expiry time
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + expiry);

        // Save OTP to database
        const otp = new OTP({
            phone_number: otpResult.phone_number,
            otp_code: otpResult.data.code || 'GENERATED', // Arkesel might not return the code
            expiry_time: expiryTime,
            purpose,
            arkesel_response: otpResult.data
        });

        await otp.save();

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            data: {
                phone_number: otpResult.phone_number,
                purpose,
                expires_at: expiryTime,
                arkesel_response: otpResult.data
            }
        });

    } catch (error) {
        console.error('Generate OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
    try {
        const { phone_number, otp_code } = req.body;

        // Validate required fields
        if (!phone_number || !otp_code) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and OTP code are required'
            });
        }

        // Find the OTP record
        const otp = await OTP.findOne({
            phone_number,
            otp_code,
            is_verified: false
        }).sort({ createdAt: -1 }); // Get the most recent OTP

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP code'
            });
        }

        // Check if OTP is expired
        if (otp.is_expired) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired'
            });
        }

        // Check if too many attempts
        if (otp.attempts >= 5) {
            return res.status(400).json({
                success: false,
                message: 'Too many verification attempts. Please request a new OTP.'
            });
        }

        // Increment attempts
        otp.attempts += 1;

        // Verify with Arkesel service
        const verifyResult = await arkeselOTPService.verifyOTP({
            phone_number,
            otp_code
        });

        if (!verifyResult.success) {
            await otp.save(); // Save the incremented attempts
            return res.status(400).json({
                success: false,
                message: 'OTP verification failed',
                error: verifyResult.error,
                attempts: otp.attempts
            });
        }

        // Mark OTP as verified
        otp.is_verified = true;
        otp.arkesel_response = {
            ...otp.arkesel_response,
            verification_response: verifyResult.data
        };

        await otp.save();

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully',
            data: {
                phone_number,
                verified_at: new Date(),
                arkesel_response: verifyResult.data
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Resend OTP
export const resendOTP = async (req, res) => {
    try {
        const { phone_number, purpose = 'phone_verification' } = req.body;

        if (!phone_number) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        // Check if there's a recent OTP (within last 2 minutes)
        const recentOTP = await OTP.findOne({
            phone_number,
            createdAt: { $gte: new Date(Date.now() - 2 * 60 * 1000) } // 2 minutes ago
        });

        if (recentOTP) {
            return res.status(400).json({
                success: false,
                message: 'Please wait 2 minutes before requesting another OTP'
            });
        }

        // Generate new OTP
        const otpResult = await arkeselOTPService.generateOTP({
            phone_number,
            purpose
        });

        if (!otpResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to resend OTP',
                error: otpResult.error
            });
        }

        // Calculate expiry time
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 5);

        // Save new OTP to database
        const otp = new OTP({
            phone_number: otpResult.phone_number,
            otp_code: otpResult.data.code || 'GENERATED',
            expiry_time: expiryTime,
            purpose,
            arkesel_response: otpResult.data
        });

        await otp.save();

        res.status(200).json({
            success: true,
            message: 'OTP resent successfully',
            data: {
                phone_number: otpResult.phone_number,
                purpose,
                expires_at: expiryTime
            }
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get OTP status
export const getOTPStatus = async (req, res) => {
    try {
        const { phone_number } = req.params;

        if (!phone_number) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        // Find the most recent OTP for this phone number
        const otp = await OTP.findOne({
            phone_number
        }).sort({ createdAt: -1 });

        if (!otp) {
            return res.status(404).json({
                success: false,
                message: 'No OTP found for this phone number'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                phone_number: otp.phone_number,
                purpose: otp.purpose,
                is_verified: otp.is_verified,
                is_expired: otp.is_expired,
                is_valid: otp.is_valid,
                attempts: otp.attempts,
                created_at: otp.createdAt,
                expires_at: otp.expiry_time
            }
        });

    } catch (error) {
        console.error('Get OTP status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Check Arkesel service status
export const checkServiceStatus = async (req, res) => {
    try {
        const isAvailable = await arkeselOTPService.checkServiceStatus();
        
        res.status(200).json({
            success: true,
            data: {
                service: 'Arkesel OTP',
                status: isAvailable ? 'available' : 'unavailable',
                checked_at: new Date()
            }
        });

    } catch (error) {
        console.error('Check service status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check service status',
            error: error.message
        });
    }
};
