"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Vehicle types
    await queryInterface.bulkInsert(
      "VehicleTypes",
      [
        {
          name: "Hatchback",
          wheels: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "SUV",
          wheels: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Sedan",
          wheels: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Cruiser",
          wheels: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        }, // bike type
      ],
      {}
    );

    // Fetch inserted types to get ids - but in seed we can assume sequence. Safer: query
    const types = await queryInterface.sequelize.query(
      `SELECT id, name FROM "VehicleTypes";`
    );
    const rows = types[0];

    const hatchbackId = rows.find((r) => r.name === "Hatchback").id;
    const suvId = rows.find((r) => r.name === "SUV").id;
    const sedanId = rows.find((r) => r.name === "Sedan").id;
    const cruiserId = rows.find((r) => r.name === "Cruiser").id;

    await queryInterface.bulkInsert(
      "Vehicles",
      [
        {
          name: "Hyundai i20",
          vehicleTypeId: hatchbackId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Maruti Swift",
          vehicleTypeId: hatchbackId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: "Toyota Fortuner",
          vehicleTypeId: suvId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Hyundai Creta",
          vehicleTypeId: suvId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: "Honda City",
          vehicleTypeId: sedanId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Skoda Octavia",
          vehicleTypeId: sedanId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: "Royal Enfield Classic 350",
          vehicleTypeId: cruiserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Harley Iron 883",
          vehicleTypeId: cruiserId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Bookings", null, {});
    await queryInterface.bulkDelete("Vehicles", null, {});
    await queryInterface.bulkDelete("VehicleTypes", null, {});
  },
};
