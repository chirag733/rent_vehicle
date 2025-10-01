const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME || "testdb",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "root123",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
  }
);

// Vehicle model: camelCase attributes map to snake_case DB columns
const Vehicle = sequelize.define(
  "Vehicle",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING },
    typeId: { type: DataTypes.INTEGER, field: "type_id" },
  },
  {
    tableName: "vehicles",
    timestamps: true,
  }
);

// Booking model: add userName mapped to user_name DB column
const Booking = sequelize.define(
  "Booking",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // keep firstName/lastName if you still want them
    firstName: { type: DataTypes.STRING, field: "firstName" },
    lastName: { type: DataTypes.STRING, field: "lastName" },
    userName: {
      type: DataTypes.STRING,
      field: "user_name",
      allowNull: false,
      defaultValue: "", // Sequelize will include this value if none provided
    },
    vehicleId: { type: DataTypes.INTEGER, field: "vehicle_id" },
    startDate: { type: DataTypes.DATEONLY, field: "start_date" },
    endDate: { type: DataTypes.DATEONLY, field: "end_date" },
  },
  {
    tableName: "bookings",
    timestamps: true,
  }
);

module.exports = { sequelize, Vehicle, Booking };
