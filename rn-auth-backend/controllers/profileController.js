import User from '../models/User.js';

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, phone, email, address, country, dob, image, ghanaPost } = req.body;
        
        // Find user
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Validate phone number if it's being updated
        if (phone) {
            // Validate phone format
            const phoneRegex = /^\+?[1-9]\d{1,14}$/;
            if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
                return res.status(400).json({ 
                    message: 'Invalid phone number format. Use international format (e.g., +233201234567)' 
                });
            }

            // Check if phone is already in use by another user
            if (phone !== user.phone) {
                const existingUser = await User.findOne({ phone });
                if (existingUser) {
                    return res.status(400).json({ message: 'Phone number already in use' });
                }
                user.phone = phone;
            }
        }

        // Update fields only if provided (partial update)
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (address !== undefined) user.address = address;
        if (country !== undefined) user.country = country;
        if (dob !== undefined) user.dob = dob;
        if (image !== undefined) user.image = image;
        if (ghanaPost !== undefined) user.ghanaPost = ghanaPost;

        await user.save();

        // Return updated user without password
        const updatedUser = await User.findById(req.userId).select('-password');
        res.status(200).json({ 
            message: 'Profile updated successfully',
            user: updatedUser 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const deleteProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await User.findByIdAndDelete(req.userId);
        
        res.status(200).json({ 
            message: 'Profile deleted successfully' 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
