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
      const [productName, price] = d.split(',').map(item => item.trim());
      return { productName, price: parseFloat(price) };
    }).filter(item => item.productName && !isNaN(item.price));

    let transaction
    try {
      // 开启事务
      const transaction = await sequelize.transaction();

      // 查找现有餐厅资料
      const restaurant = await Restaurant.findByPk(restId, {
        include: [Meal],
        transaction
      });

      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      // 更新餐厅资料
      await restaurant.update({ name, tel, address }, { transaction });

      // 遍历并更新或创建餐点数据
      for (const item of descriptionArray) {
        const [meal, created] = await Meal.findOrCreate({
          where: {
            restaurantId: restaurant.id,
            meals: item.productName
          },
          defaults: { price: item.price },
          transaction
        });

        if (!created) {
          // 如果餐点已经存在，更新价格
          await meal.update({ price: item.price }, { transaction });
        }
      }

      // 如果需要，可以删除不再包含在descriptionArray中的餐点
      const currentMeals = descriptionArray.map(item => item.productName);
      await Meal.destroy({
        where: {
          restaurantId: restaurant.id,
          meals: { [Op.notIn]: currentMeals }
        },
        transaction
      });

      // 提交事务
      await transaction.commit();

      res.redirect(`/admin/restaurants/${restId}`);
    } catch (err) {
      // 出现错误时回滚事务
      if (transaction) await transaction.rollback();
      next(err);
    }
  }
}

module.exports = adminController