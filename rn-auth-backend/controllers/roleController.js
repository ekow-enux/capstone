import Role from '../models/Role.js';

// Create Role
export const createRole = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ 
                success: false, 
                message: 'Role name is required' 
            });
        }

        const role = new Role({ name, description });
        await role.save();

        res.status(201).json({ 
            success: true, 
            message: 'Role created successfully', 
            data: role 
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Role name already exists' 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get All Roles
export const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find().sort({ name: 1 });
        
        res.status(200).json({ 
            success: true, 
            count: roles.length, 
            data: roles 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Get Role By ID
export const getRoleById = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({ 
                success: false, 
                message: 'Role not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: role 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Update Role
export const updateRole = async (req, res) => {
    try {
        const { name, description } = req.body;

        const role = await Role.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true, runValidators: true }
        );

        if (!role) {
            return res.status(404).json({ 
                success: false, 
                message: 'Role not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Role updated successfully', 
            data: role 
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: 'Role name already exists' 
            });
        }
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Delete Role
export const deleteRole = async (req, res) => {
    try {
        const role = await Role.findByIdAndDelete(req.params.id);

        if (!role) {
            return res.status(404).json({ 
                success: false, 
                message: 'Role not found' 
            });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Role deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

