const { VehicleType, Vehicle } = require("../models");

module.exports = {
  async getVehicleTypes(req, res) {
    try {
      const wheels = req.query.wheels ? parseInt(req.query.wheels, 10) : null;
      const where = wheels ? { wheels } : {};
      const types = await VehicleType.findAll({ where });
      res.json(types);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getVehicles(req, res) {
    try {
      const typeId = req.query.typeId;
      if (!typeId) return res.status(400).json({ error: "typeId required" });
      const vehicles = await Vehicle.findAll({
        where: { vehicleTypeId: typeId },
      });
      res.json(vehicles);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
};
