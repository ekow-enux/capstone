import mongoose from 'mongoose';

const fireSafetyTipSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Content is required'],
        trim: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for efficient queries
fireSafetyTipSchema.index({ title: 'text', content: 'text' });

export default mongoose.model('FireSafetyTip', fireSafetyTipSchema);
