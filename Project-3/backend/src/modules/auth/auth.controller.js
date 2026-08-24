const db = require('../../config/database.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const createUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const checkUserQuery = `
            SELECT * FROM users
            WHERE email = $1;
        `;
        const userCheck = await db.query(checkUserQuery, [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({
                status: "failed",
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const createUserQuery = `
            INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role;
        `;

        const result = await db.query(createUserQuery, [
            name,
            email,
            hashedPassword,
            role || "guest"
        ]);

        const token = jwt.sign(
            { id: result.rows[0].id, email: result.rows[0].email, role: result.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            status: "success",
            message: "User created successfully",
            data: result.rows[0],
            token: token
        });

    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "User cannot be created",
            error: error
        });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    const getUserQuery = `
        SELECT * FROM users
        WHERE email = $1;
    `;

    try {
        const result = await db.query(getUserQuery, [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({
                status: "failed",
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({
                status: "failed",
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            status: "success",
            message: "Login successful",
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token: token
        });

    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Something went wrong",
            error: error
        });
    }
};

const getUserDetails = async (req, res) => {
    const { id } = req.user;

    const getUserQuery = `
        SELECT id, name, email, role, phone, avatar_url, bio FROM users
        WHERE id = $1;
    `;

    try {
        const result = await db.query(getUserQuery, [id]);
        return res.status(200).json({
            status: "success",
            message: "Retrieved user details successfully",
            data: result.rows[0]
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: "Failed to retrieve user details",
            error: error
        });
    }
};

const refreshToken = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({
            status: "failed",
            message: "Refresh token is required"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
        const newToken = jwt.sign(
            { id: decoded.id, email: decoded.email, role: decoded.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            status: "success",
            message: "Token refreshed successfully",
            token: newToken
        });
    } catch (error) {
        return res.status(401).json({
            status: "failed",
            message: "Invalid or expired refresh token",
            error: error
        });
    }
};

module.exports = {
    createUser,
    loginUser,
    getUserDetails,
    refreshToken
};
