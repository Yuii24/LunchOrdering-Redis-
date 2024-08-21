'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mealorder extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Mealorder.belongsTo(models.Personalorder, { foreignKey: 'personalorderId', onDelete: 'CASCADE', onUpdate: 'CASCADE' })
    }
  }
  Mealorder.init({
    meals: DataTypes.STRING,
    price: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    mealtotal: DataTypes.INTEGER,
    personalorderId: DataTypes.INTEGER,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Mealorder',
    tableName: 'Mealorders',
    underscored: true,
  });
  return Mealorder;
};