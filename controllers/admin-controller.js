const { Restaurant, Meal, sequelize } = require('../models')
const { Order, User } = require('../models')
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');


const adminController = {
  getAllOrders: (req, res, next) => {
    sequelize.query("SELECT DATE_FORMAT(CONVERT_TZ(created_at, '+00:00', '+08:00'), '%Y-%m-%d') AS unique_date FROM orders GROUP BY unique_date ORDER BY unique_date DESC", { type: sequelize.QueryTypes.SELECT })
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
      timezone: '+08:00',
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
  },
  getRestaurants: (req, res, next) => {
    Restaurant.findAll({
      raw: true,
      nest: true
    })
      .then(restaurants => {
        console.log(restaurants)
        res.render('admin/restaurants', { restaurants })
      })
      .catch(err => next(err))
  },
  createRestaurants: (req, res, next) => {
    res.render('admin/create-restaurant')
  },
  psotRestaurants: async (req, res, next) => {
    const { name, tel, address, description } = req.body
    console.log('name', name)
    console.log('tel', tel)
    console.log('adcress', address)
    console.log('description', description)

    const descriptionArray = description.split('\n').map(d => {
      const [productName, price] = d.split(',').map(item => item.trim())
      return { productName, price: parseFloat(price) }
    })

    console.log('訂餐內容', descriptionArray);

    try {
      // 开启事务
      const transaction = await sequelize.transaction();

      // 新增餐廳資料
      const restaurant = await Restaurant.create(
        {
          name,
          tel,
          address,
        },
        { transaction }
      );
      // 新增餐點資料
      const menuItemsData = descriptionArray.map(item => ({
        meals: item.productName,
        price: item.price,
        restaurantId: restaurant.id // 关联的restaurantId
      }));

      await Meal.bulkCreate(menuItemsData, { transaction });

      // 提交事务
      await transaction.commit();

      res.redirect('/admin/restaurants')
      // res.status(201).json({ message: 'Restaurant and menu items created successfully', restaurant });
    } catch (err) {
      // 出现错误时回滚事务
      if (transaction) await transaction.rollback();
      next(err);
    }
  }
}

module.exports = adminController