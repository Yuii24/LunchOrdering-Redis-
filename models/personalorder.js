'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Personalorder extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Personalorder.belongsTo(models.Order, { foreignKey: 'orderId' })
      Personalorder.belongsTo(models.User, { foreignKey: 'UserId' })
      Personalorder.hasMany(models.Mealorder, { foreignKey: 'personalorderId' })
    }
  }
  Personalorder.init({
    name: DataTypes.STRING,
    employeeId: DataTypes.INTEGER,
    totalprice: DataTypes.INTEGER,
    orderId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    restaurantName: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Personalorder',
    tableName: 'Personalorders',
    underscored: true,
  });
  return Personalorder;
};