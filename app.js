const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const bookingRoutes = require("./routes/bookingRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");

const app = express(); // <-- Define app first!

app.use(cors());
app.use(bodyParser.json());

app.use("/api", vehicleRoutes);
app.use("/api", bookingRoutes);

app.get("/", (req, res) => res.json({ message: "Octalogic rental API" }));

module.exports = app;
