import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

class ArkeselOTPService {
    constructor() {
        this.baseURL = 'https://sms.arkesel.com/api/otp';
        this.apiKey = process.env.ARKSEND;
        
        if (!this.apiKey) {
            throw new Error('ARKSEND API key is required in environment variables');
        }
        
        this.headers = {
            'api-key': this.apiKey,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Generate OTP and send SMS
     * @param {Object} options - OTP generation options
     * @param {string} options.phone_number - Phone number to send OTP to
     * @param {number} options.expiry - OTP expiry time in minutes (default: 5)
     * @param {number} options.length - OTP length (default: 6)
     * @param {string} options.medium - Medium to send OTP (default: 'sms')
     * @param {string} options.message - Custom message template
     * @param {string} options.sender_id - Sender ID (default: 'Arkesel')
     * @param {string} options.type - OTP type (default: 'numeric')
     * @param {string} options.purpose - Purpose of OTP (default: 'phone_verification')
     * @returns {Promise<Object>} - Arkesel API response
     */
    async generateOTP(options) {
        try {
            const {
                phone_number,
                expiry = 5,
                length = 6,
                medium = 'sms',
                message = 'Your OTP code is %otp_code%. Valid for 5 minutes.',
                sender_id = 'Arkesel',
                type = 'numeric',
                purpose = 'phone_verification'
            } = options;

            // Validate phone number
            if (!phone_number || typeof phone_number !== 'string') {
                throw new Error('Phone number is required');
            }

            // Format phone number (ensure it starts with country code)
            const formattedPhone = this.formatPhoneNumber(phone_number);

            const data = {
                expiry,
                length,
                medium,
                message,
                number: formattedPhone,
                sender_id,
                type
            };

            console.log('Sending OTP request to Arkesel:', {
                ...data,
                api_key: this.apiKey.substring(0, 10) + '...' // Log partial key for debugging
            });

            const response = await axios.post(`${this.baseURL}/generate`, data, {
                headers: this.headers,
                timeout: 30000 // 30 seconds timeout
            });

            console.log('Arkesel OTP response:', response.data);

            return {
                success: true,
                data: response.data,
                phone_number: formattedPhone,
                purpose
            };

        } catch (error) {
            console.error('Arkesel OTP generation error:', error.response?.data || error.message);
            
            return {
                success: false,
                error: error.response?.data || error.message,
                phone_number: options.phone_number
            };
        }
    }

    /**
     * Verify OTP code
     * @param {Object} options - OTP verification options
     * @param {string} options.phone_number - Phone number
     * @param {string} options.otp_code - OTP code to verify
     * @returns {Promise<Object>} - Verification result
     */
    async verifyOTP(options) {
        try {
            const { phone_number, otp_code } = options;

            if (!phone_number || !otp_code) {
                throw new Error('Phone number and OTP code are required');
            }

            const formattedPhone = this.formatPhoneNumber(phone_number);

            const data = {
                number: formattedPhone,
                code: otp_code
            };

            console.log('Verifying OTP with Arkesel:', {
                ...data,
                api_key: this.apiKey.substring(0, 10) + '...'
            });

            const response = await axios.post(`${this.baseURL}/verify`, data, {
                headers: this.headers,
                timeout: 30000
            });

            console.log('Arkesel OTP verification response:', response.data);

            return {
                success: true,
                data: response.data,
                phone_number: formattedPhone
            };

        } catch (error) {
            console.error('Arkesel OTP verification error:', error.response?.data || error.message);
            
            return {
                success: false,
                error: error.response?.data || error.message,
                phone_number: options.phone_number
            };
        }
    }

    /**
     * Format phone number to include country code
     * @param {string} phoneNumber - Phone number to format
     * @returns {string} - Formatted phone number
     */
    formatPhoneNumber(phoneNumber) {
        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '');
        
        // If it starts with 0, replace with 233 (Ghana country code)
        if (cleaned.startsWith('0')) {
            return '233' + cleaned.substring(1);
        }
        
        // If it starts with 233, return as is
        if (cleaned.startsWith('233')) {
            return cleaned;
        }
        
        // If it's a local number without country code, add 233
        if (cleaned.length === 9) {
            return '233' + cleaned;
        }
        
        // Return as is if already formatted
        return cleaned;
    }

    /**
     * Check if Arkesel service is available
     * @returns {Promise<boolean>} - Service availability
     */
    async checkServiceStatus() {
        try {
            const response = await axios.get(`${this.baseURL}/status`, {
                headers: this.headers,
                timeout: 10000
            });
            
            return response.status === 200;
        } catch (error) {
            console.error('Arkesel service status check failed:', error.message);
            return false;
        }
    }
}

export default new ArkeselOTPService();
