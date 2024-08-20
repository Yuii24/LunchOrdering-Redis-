'use strict';
const {
  Model
} = require('sequelize');
const { combineTableNames } = require('sequelize/lib/utils');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    // static associate(models) {
    //   Order.belongsTo(models.User, { foreignKey: 'userId' })
    // }
    static associate(models) {
      Order.belongsTo(models.Restaurant, { foreignKey: 'restaurantId' })
      Order.hasMany(models.Personalorder, { foreignKey: 'orderId' })
    }
  }
  Order.init({
    name: DataTypes.STRING,
    employeeId: DataTypes.INTEGER,
    restaurantId: DataTypes.INTEGER,
    isOpen: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'Orders',
    underscored: true
  });
  return Order;
};