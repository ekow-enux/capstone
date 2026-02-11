import FireSafetyTip from '../models/FireSafetyTip.js';

// Create a new fire safety tip
export const createFireSafetyTip = async (req, res) => {
    try {
        const { title, content } = req.body;

        const fireSafetyTip = new FireSafetyTip({
            title,
            content
        });

        await fireSafetyTip.save();
        res.status(201).json({
            success: true,
            message: 'Fire safety tip created successfully',
            data: fireSafetyTip
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create fire safety tip',
            error: error.message
        });
    }
};

// Get all fire safety tips
export const getAllFireSafetyTips = async (req, res) => {
    try {
        const fireSafetyTips = await FireSafetyTip.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: fireSafetyTips.length,
            data: fireSafetyTips
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve fire safety tips',
            error: error.message
        });
    }
};

// Get a single fire safety tip by ID
export const getFireSafetyTipById = async (req, res) => {
    try {
        const fireSafetyTip = await FireSafetyTip.findById(req.params.id);

        if (!fireSafetyTip) {
            return res.status(404).json({
                success: false,
                message: 'Fire safety tip not found'
            });
        }

        res.status(200).json({
            success: true,
            data: fireSafetyTip
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve fire safety tip',
            error: error.message
        });
    }
};

// Update a fire safety tip
export const updateFireSafetyTip = async (req, res) => {
    try {
        const { title, content } = req.body;

        const fireSafetyTip = await FireSafetyTip.findByIdAndUpdate(
            req.params.id,
            { title, content },
            { new: true, runValidators: true }
        );

        if (!fireSafetyTip) {
            return res.status(404).json({
                success: false,
                message: 'Fire safety tip not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Fire safety tip updated successfully',
            data: fireSafetyTip
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update fire safety tip',
            error: error.message
        });
    }
};

// Delete a fire safety tip
export const deleteFireSafetyTip = async (req, res) => {
    try {
        const fireSafetyTip = await FireSafetyTip.findByIdAndDelete(req.params.id);

        if (!fireSafetyTip) {
            return res.status(404).json({
                success: false,
                message: 'Fire safety tip not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Fire safety tip deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete fire safety tip',
            error: error.message
        });
    }
};
