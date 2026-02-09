import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Role name is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String
    }
}, { 
    timestamps: true 
});

export default mongoose.model('Role', roleSchema);


