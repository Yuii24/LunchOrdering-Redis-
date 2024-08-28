const { Restaurant, Meal, sequelize } = require('../models')
const { Order, User } = require('../models')
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const { client, connectRedis } = require('../helpers/redis-helper');


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
        next(err)
      })
  },
  getRestaurants: (req, res, next) => {
    Restaurant.findAll({
      raw: true,
      nest: true
    })
      .then(restaurants => {
        res.render('admin/restaurants', { restaurants })
      })
      .catch(err => next(err))
  },
  createRestaurants: (req, res, next) => {
    res.render('admin/create-restaurant')
  },
  psotRestaurants: async (req, res, next) => {
    const { name, tel, address, description } = req.body

    const descriptionArray = description.split('\n').map(d => {
      const [productName, price] = d.split(',').map(item => item.trim())
      return { productName, price: parseFloat(price) }
    })

    try {
      const restaurant = await Restaurant.create(
        {
          name,
          tel,
          address,
        }
      )
      const menuItemsData = descriptionArray.map(item => ({
        meals: item.productName,
        price: item.price,
        restaurantId: restaurant.id
      }));

      await Meal.bulkCreate(menuItemsData);


      res.redirect('/admin/restaurants')
    } catch (err) {
      next(err);
    }
  },
  getRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, {
      include: [Meal]
    })
      .then(restaurant => {
        res.render('admin/restaurant', { restaurant: restaurant.toJSON() })
      })
      .catch(err => next(err))
  },
  editRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, {
      include: [Meal],
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("此餐廳不存在")

        res.render('admin/edit-restaurant', { restaurant: restaurant.toJSON() })
      })
      .catch(err => next(err))
  },
  putRestaurant: async (req, res, next) => {
    const restId = req.params.id
    const { name, tel, address, description } = req.body
    if (!name) throw new Error("請輸入餐廳名稱")
    if (!tel) throw new Error("請輸入餐廳電話")

    const descriptionArray = description.split('\n').map(d => {
      const [productName, price] = d.split(',').map(item => item.trim())
      return { productName, price: parseFloat(price) }
    }).filter(item => item.productName && !isNaN(item.price))


    try {
      const restaurant = await Restaurant.findByPk(restId, {
        include: [Meal]
      });

      if (!restaurant) {
        throw new Error('Restaurant not found')
      }

      await restaurant.update({ name, tel, address })

      for (const item of descriptionArray) {
        const [meal, created] = await Meal.findOrCreate({
          where: {
            restaurantId: restaurant.id,
            meals: item.productName
          },
          defaults: { price: item.price },
        })

        if (!created) {
          // 如果餐點已经存在，更新價格
          await meal.update({ price: item.price });
        }
      }

      const currentMeals = descriptionArray.map(item => item.productName);
      await Meal.destroy({
        where: {
          restaurantId: restaurant.id,
          meals: { [Op.notIn]: currentMeals }
        }
      });

      res.redirect(`/admin/restaurants/${restId}`);
    } catch (err) {
      next(err);
    }
  },
  deleteMeal: (req, res, next) => {
    const mealId = req.params.id
    let restId

    Meal.findByPk(mealId, {
      include: [Restaurant]
    })
      .then(meal => {
        if (!meal) throw new Error("餐點並不存在!")

        restId = meal.Restaurant.id
        return meal.destroy().then(() => restId)
      })
      .then(() => {
        req.flash("success_messages", "刪除成功!")
        return res.redirect(`/admin/restaurants/${restId}`)
      })
      .catch(err => next(err))
  },
  openOrder: async (req, res, next) => {
    const restId = req.params.id

    try {
      const { name, employeeId, ordername } = req.body
      const restaurant = await Restaurant.findByPk(restId)

      if (!restaurant) throw new Error("此餐廳不存在!")

      await Order.create({
        name: name,
        employeeId: employeeId,
        restaurantId: restId,
        isOpen: true,
        ordername: ordername
      })
      await client.del('orderingrest_data')
      req.flash("success_messages", "已經開放訂單!")
      console.log("client.del('orderingrest_data') completed")
      return res.redirect(`/admin/restaurants/${restId}`)

    } catch (err) {
      next(err)
    }
  },
  closeOrder: async (req, res, next) => {
    const orderId = req.params.id

    try {
      const order = await Order.findByPk(orderId)

      if (!order.isOpen) throw new Error('這個訂單並未開放!')

      await order.update({
        isOpen: false
      })

      req.flash('success_messages', '訂單已經關閉')
      res.redirect('/orderingrest')
    } catch (err) {
      next(err)
    }
  },
  getCloseOrder: (req, res, next) => {
    Order.findAll({
      where: {
        isOpen: false
      },
      include: [Restaurant],
      order: [
        ['createdAt', 'DESC']
      ]
    })
      .then(orders => {
        const orderDate = orders.map(orders => orders.toJSON())
        return res.render('admin/backOrder', { orders: orderDate })
      })
  },
  reopenOrder: async (req, res, next) => {
    const orderId = req.params.id

    try {
      const order = await Order.findByPk(orderId)

      if (order.isOpen) throw new Error('這個訂單並未關閉!')

      await order.update({
        isOpen: true
      })

      req.flash('success_messages', '訂單已經開啟')
      res.redirect('/orderingrest')
    } catch (err) {
      next(err)
    }
  },
  getNewRestOrder: async (req, res, next) => {
    const restId = req.params.id

    const restaurant = await Restaurant.findByPk(restId, {
      raw: true,
      nest: true
    })
    if (!restaurant) throw new Error("此餐廳不存在!")

    res.render('admin/newRestOrder', { restaurant })
  },
  getAdminBack: (req, res, next) => {
    return res.render('admin/adminback')
  }
}

module.exports = adminController