module.exports = (sequelize, DataTypes) => {
  const Vehicle = sequelize.define(
    "Vehicle",
    {
      name: { type: DataTypes.STRING, allowNull: false },
      vehicleTypeId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {}
  );
  return Vehicle;
};
