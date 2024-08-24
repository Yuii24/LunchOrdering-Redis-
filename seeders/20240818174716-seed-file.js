'use strict';
const bcrypt = require('bcrypt')
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Users', [{
      id: 1,
      employee_id: 1130000,
      name: 'root',
      email: 'root@example.com',
      password: await bcrypt.hash('123456', 10),
      is_admin: true,
      created_at: new Date(),
      updated_at: new Date()
    }], {})
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', {})
  }
};
