module.exports = (sequelize, DataTypes) => {
  const VehicleType = sequelize.define(
    "VehicleType",
    {
      name: { type: DataTypes.STRING, allowNull: false },
      wheels: { type: DataTypes.INTEGER, allowNull: false },
    },
    {}
  );
  return VehicleType;
};
