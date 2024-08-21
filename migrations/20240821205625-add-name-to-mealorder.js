'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Mealorders', 'name', {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn('Mealorders', 'employee_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Mealorders', 'name')

    await queryInterface.removeColumn('Mealorders', 'employee_id')
  }
};
