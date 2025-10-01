const express = require("express");
const router = express.Router();
const controller = require("../controllers/vehicleController");

router.get("/vehicle-types", controller.getVehicleTypes); // optional ?wheels=
router.get("/vehicles", controller.getVehicles); // ?typeId=

module.exports = router;
