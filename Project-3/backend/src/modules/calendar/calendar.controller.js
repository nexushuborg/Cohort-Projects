const db = require('../../config/database.js');

// 1. Get calendar blocks and optionally check date availability
const getPropertyCalendar = async (req, res) => {
    const { propertyId } = req.params;
    const { check_in, check_out } = req.query;

    try {
        // Fetch property information to retrieve stay-duration rules
        const getPropertyQuery = `SELECT * FROM properties WHERE id = $1;`;
        const propertyRes = await db.query(getPropertyQuery, [propertyId]);

        if (propertyRes.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: { code: "NOT_FOUND", message: "Property not found" }
            });
        }
        const property = propertyRes.rows[0];

        // Fetch all blocks
        const getBlocksQuery = `
            SELECT id, start_date, end_date, reason 
            FROM availability_blocks 
            WHERE property_id = $1 
            ORDER BY start_date ASC;
        `;
        const blocksRes = await db.query(getBlocksQuery, [propertyId]);
        const blocks = blocksRes.rows;

        // If specific check-in / check-out is provided, verify availability
        if (check_in && check_out) {
            const checkInDate = new Date(check_in);
            const checkOutDate = new Date(check_out);
            const totalNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

            if (isNaN(totalNights) || totalNights <= 0) {
                return res.status(400).json({
                    success: false,
                    error: { code: "VALIDATION_ERROR", message: "Invalid date ranges provided" }
                });
            }

            // A. Check Stay Stay Rules
            const minNights = property.min_nights || 1;
            const maxNights = property.max_nights || 30;

            if (totalNights < minNights) {
                return res.status(200).json({
                    success: true,
                    data: {
                        available: false,
                        reason: `Stay duration of ${totalNights} nights is below the minimum limit of ${minNights} nights.`
                    }
                });
            }

            if (totalNights > maxNights) {
                return res.status(200).json({
                    success: true,
                    data: {
                        available: false,
                        reason: `Stay duration of ${totalNights} nights exceeds the maximum limit of ${maxNights} nights.`
                    }
                });
            }

            // B. Date Conflict Detection
            const conflictQuery = `
                SELECT * FROM availability_blocks
                WHERE property_id = $1 AND start_date < $2 AND end_date > $3;
            `;
            const conflictRes = await db.query(conflictQuery, [propertyId, check_out, check_in]);

            if (conflictRes.rows.length > 0) {
                return res.status(200).json({
                    success: true,
                    data: {
                        available: false,
                        reason: "Selected date range overlaps with an existing booking or blocked dates."
                    }
                });
            }

            return res.status(200).json({
                success: true,
                data: {
                    available: true,
                    totalNights,
                    totalPrice: totalNights * parseFloat(property.price_per_night)
                }
            });
        }

        return res.status(200).json({
            success: true,
            data: { blocks }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "INTERNAL_ERROR", message: "Failed to query availability details", details: error.message }
        });
    }
};

// 2. Block dates (Host Only)
const blockDates = async (req, res) => {
    const { propertyId } = req.params;
    const { start_date, end_date, reason } = req.body;
    const userId = req.user.id;

    if (!start_date || !end_date) {
        return res.status(400).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "start_date and end_date are required" }
        });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (isNaN(startDate) || isNaN(endDate) || endDate <= startDate) {
        return res.status(400).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "Invalid date range structure" }
        });
    }

    try {
        // Verify property ownership
        const propertyRes = await db.query("SELECT host_id FROM properties WHERE id = $1;", [propertyId]);
        if (propertyRes.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: { code: "NOT_FOUND", message: "Property not found" }
            });
        }

        if (propertyRes.rows[0].host_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: { code: "FORBIDDEN", message: "Access denied. Only the host of this property can block dates." }
            });
        }

        // Date conflict check: Prevent overlapping blocked dates
        const overlapQuery = `
            SELECT * FROM availability_blocks
            WHERE property_id = $1 AND start_date < $2 AND end_date > $3;
        `;
        const overlapRes = await db.query(overlapQuery, [propertyId, end_date, start_date]);

        if (overlapRes.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: { code: "CONFLICT", message: "Proposed date range conflicts with existing blocks/bookings" }
            });
        }

        const insertBlockQuery = `
            INSERT INTO availability_blocks (property_id, start_date, end_date, reason)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const blockRes = await db.query(insertBlockQuery, [propertyId, start_date, end_date, reason || 'host_blocked']);

        return res.status(201).json({
            success: true,
            data: blockRes.rows[0]
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "INTERNAL_ERROR", message: "Failed to block dates", details: error.message }
        });
    }
};

// 3. Unblock dates (Host Only)
const unblockDates = async (req, res) => {
    const { blockId } = req.params;
    const userId = req.user.id;

    try {
        // Fetch block and confirm ownership
        const blockQuery = `
            SELECT b.*, p.host_id 
            FROM availability_blocks b
            JOIN properties p ON b.property_id = p.id
            WHERE b.id = $1;
        `;
        const blockRes = await db.query(blockQuery, [blockId]);

        if (blockRes.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: { code: "NOT_FOUND", message: "Availability block not found" }
            });
        }

        if (blockRes.rows[0].host_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: { code: "FORBIDDEN", message: "Access denied. Only the property host can remove blocks." }
            });
        }

        await db.query("DELETE FROM availability_blocks WHERE id = $1;", [blockId]);

        return res.status(200).json({
            success: true,
            message: "Dates unblocked successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: { code: "INTERNAL_ERROR", message: "Failed to remove block", details: error.message }
        });
    }
};

module.exports = {
    getPropertyCalendar,
    blockDates,
    unblockDates
};