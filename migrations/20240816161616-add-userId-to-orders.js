'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Order', 'user_id', {
      typer: Sequelize.INTEGER,
      defaultValue: false
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Order', 'user_id')
  }
};
