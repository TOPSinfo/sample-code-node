("use strict");
module.exports = (sequelize, DataTypes) => {
  let aboutUs = sequelize.define(
    "aboutUs",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      subtitle: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
    },
    {
      tableName: "aboutUs",
      timestamp: true,
    }
  );
  return aboutUs;
};
