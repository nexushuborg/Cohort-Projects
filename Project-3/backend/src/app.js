const express = require ('express');
require ('dotenv').config();
const cors = require ('cors');
const helmet = require ('helmet');
const morgan = require ('morgan');
const { initDatabase } = require("./migrations/initDb.js");
const { authRoute } = require("./modules/auth/auth.routes.js");
const { bookingRoute } = require("./modules/bookings/bookings.routes.js");

const app= express();
const PORT =process.env.PORT;
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());


app.use("/api/auth", authRoute);
app.use("/api/bookings", bookingRoute);
app.get ("/", (req,res)=>{
    res.send({
        success: true,
        message: "Rental Marketplace API is running!",
    })
})
initDatabase();
app.listen(process.env.PORT, (err)=>{
    if (err) {
        console.log(err);
        return;}
    console.log(`Rental Marketplace API is running on port ${PORT}`);
})
