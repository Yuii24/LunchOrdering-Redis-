const { sequelize } = require('../models')
const { Order, User } = require('../models')
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');


const adminController = {
  getAllOrders: (req, res, next) => {
    sequelize.query("SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS unique_date FROM orders GROUP BY unique_date ORDER BY unique_date DESC", { type: sequelize.QueryTypes.SELECT })
      .then((allorders) => {
        allorders = allorders.map(orders => { return { ...orders } })
        res.render('admin/allOrders', { allorders })
      })
      .catch(err => next(err))
  },
  getDailyOrder: (req, res, next) => {
    const date = req.params.date
    console.log('date', date)
    const today = new Date();
    const startOfDay = `${date} 00:00:00`;
    const endOfDay = `${date} 23:59:59`;

    Order.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      raw: true,
      nest: true
    })
      .then(order => {
        res.render('admin/dailyOrder', { order })
      })
      .catch(err => {
        console.log(err)
        next(err)
      })
  }
}

module.exports = adminController