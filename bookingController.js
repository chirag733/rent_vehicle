const { Booking, Vehicle } = require("../../models");
const { Op } = require("sequelize");

module.exports = {
  async createBooking(req, res) {
    try {
      const { firstName, lastName, vehicleId, startDate, endDate } = req.body;
      if (!firstName || !lastName || !vehicleId || !startDate || !endDate) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Validate vehicle exists
      const vehicle = await Vehicle.findByPk(vehicleId);
      if (!vehicle) return res.status(400).json({ error: "Vehicle not found" });

      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({ error: "Invalid date format" });
      }
      if (end < start)
        return res.status(400).json({ error: "endDate must be >= startDate" });

      // Overlap check: existing.startDate <= new.endDate AND existing.endDate >= new.startDate
      // Use model attribute names; Sequelize maps them to the correct DB columns via model.field
      const conflicting = await Booking.findOne({
        where: {
          vehicleId,
          startDate: { [Op.lte]: endDate },
          endDate: { [Op.gte]: startDate },
        },
      });

      if (conflicting) {
        return res
          .status(409)
          .json({ error: "Vehicle already booked for the selected dates" });
      }

      const newBooking = await Booking.create({
        firstName,
        lastName,
        vehicleId,
        startDate,
        endDate,
      });

      return res.status(201).json(newBooking);
    } catch (err) {
      console.error("createBooking error:", err);
      return res.status(500).json({ error: err.message });
    }
  },

  async listBookings(req, res) {
    try {
      const where = {};
      if (req.query.vehicleId) where.vehicleId = req.query.vehicleId;
      const bookings = await Booking.findAll({ where });
      res.json(bookings);
    } catch (err) {
      console.error("listBookings error:", err);
      res.status(500).json({ error: err.message });
    }
  },
};
