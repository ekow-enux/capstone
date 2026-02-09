import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    phone_number: {
        type: String,
        required: true,
        trim: true
    },
    otp_code: {
        type: String,
        required: true,
        trim: true
    },
    expiry_time: {
        type: Date,
        required: true
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    attempts: {
        type: Number,
        default: 0,
        max: 5
    },
    purpose: {
        type: String,
        enum: ['registration', 'login', 'password_reset', 'phone_verification'],
        default: 'phone_verification'
    },
    arkesel_response: {
        type: mongoose.Schema.Types.Mixed,
        required: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for efficient queries
otpSchema.index({ phone_number: 1, expiry_time: 1 });
otpSchema.index({ otp_code: 1 });

// Virtual to check if OTP is expired
otpSchema.virtual('is_expired').get(function() {
    return new Date() > this.expiry_time;
});

// Virtual to check if OTP is valid (not expired and not verified)
otpSchema.virtual('is_valid').get(function() {
    return !this.is_expired && !this.is_verified && this.attempts < 5;
});

export default mongoose.model('OTP', otpSchema);
