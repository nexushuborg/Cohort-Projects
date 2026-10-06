const express = require('express');
require('dotenv').config();
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { initDatabase } = require("./migrations/initDb.js");
const { authRoute } = require("./modules/auth/auth.routes.js");
const { userRoute } = require("./modules/users/users.routes.js");
const { bookingRoute } = require("./modules/bookings/bookings.routes.js");
const { reviewRoute } = require("./modules/reviews/reviews.routes.js");
const { propertyRoute } = require("./modules/properties/properties.routes.js");
const { calendarRoute } = require("./modules/calendar/calendar.routes.js");
const { paymentsRoute } = require("./modules/payments/payments.routes.js");
const { searchRoute } = require("./modules/search/search.routes.js");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/properties", propertyRoute);
app.use("/api/search", searchRoute);
app.use("/api/availability", calendarRoute);
app.use("/api/payments", paymentsRoute);

app.get("/", (req, res) => {
    res.send({
        status: "success",
        message: "Rental Marketplace API is running!"
    });
});

app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(err.status || 500).json({
        status: "failed",
        message: err.message || "Internal server error"
    });
});

initDatabase();

app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log(`Rental Marketplace API is running on port ${PORT}`);
});
