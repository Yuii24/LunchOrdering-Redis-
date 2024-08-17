const { Order, User } = require('../models')
const { Op } = require('sequelize');
const bcrypt = require('bcrypt')

const adminController = {
  getAllOrders: (req, res, next) => {
    return res.render('admin/allOrders')
  }
}

module.exports = adminController