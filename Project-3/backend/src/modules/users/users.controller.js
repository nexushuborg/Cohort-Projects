const db = require('../../config/database.js');

const updateProfile = async (req, res) => {
    const { id } = req.user;
    const { name, phone, bio, avatar_url } = req.body;

    const updateUserQuery = `
        UPDATE users
        SET name = COALESCE($1, name),
            phone = COALESCE($2, phone),
            bio = COALESCE($3, bio),
            avatar_url = COALESCE($4, avatar_url),
            updated_at = NOW()
        WHERE id = $5
        RETURNING id, name, email, role, phone, bio, avatar_url;
    `;

    try {
        const result = await db.query(updateUserQuery, [
            name || null,
            phone || null,
            bio || null,
            avatar_url || null,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: "failed",
                message: "User not found"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Profile updated successfully",
            data: result.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to update profile",
            error: error
        });
    }
};

const getPublicProfile = async (req, res) => {
    const { id } = req.params;

    const getProfileQuery = `
        SELECT id, name, role, bio, avatar_url, created_at FROM users
        WHERE id = $1;
    `;

    try {
        const result = await db.query(getProfileQuery, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: "failed",
                message: "User profile not found"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Retrieved user profile successfully",
            data: result.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to fetch user profile",
            error: error
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to fetch user profile",
            error: error
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT id, name, email, role, phone, bio, avatar_url, created_at
            FROM users
            ORDER BY created_at DESC;
        `);
        return res.status(200).json({
            status: "success",
            message: "Users retrieved successfully",
            data: result.rows
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to fetch users",
            error: error.message
        });
    }
};

module.exports = {
    updateProfile,
    getPublicProfile,
    getAllUsers
};

