const { Order, User, Restaurant, Meal, Personalorder, Mealorder } = require('../models')
const { sequelize } = require('../models')
const { Op } = require('sequelize');
const bcrypt = require('bcrypt')


const { client, connectRedis } = require('../helpers/redis-helper');


const orderController = {
  getOrderingRest: async (req, res, next) => {
    try {
      const cacheKey = 'orderingrest_data';

      // 確認Redis連線
      await connectRedis();

      // 查看Redis是否有這筆資料
      const cachedData = await client.get(cacheKey);

      if (cachedData) {
        // 如果有將直接回傳Redis資料
        console.log('Data retrieved from Redis');
        return res.render('orderingrest', { orders: JSON.parse(cachedData) });
      }

      // 如果沒有進入MySQL查詢
      const orders = await Order.findAll({
        attributes: ['id', 'name', 'employeeId', 'ordername'],
        where: { isOpen: true },
        include: [{
          model: Restaurant,
          attributes: ['name'],
        }],
        order: [['createdAt', 'DESC']],
      });

      const orderDate = orders.map(order => order.toJSON());
      console.log('Data retrieved from MySQL:', orderDate);

      // 將資料也傳入Redis，不設定過期時間
      await client.set(cacheKey, JSON.stringify(orderDate));

      return res.render('orderingrest', { orders: orderDate });
    } catch (error) {
      console.error('Error fetching ordering data:', error);
      return next(error);
    }
    // Order.findAll({
    //   attributes: [
    //     'id',
    //     'name',
    //     'employeeId',
    //     'ordername'
    //   ],
    //   where: {
    //     isOpen: true
    //   },
    // include: [{
    //   model: Restaurant,
    //   attributes: ['name'],
    // }],
    //   order: [
    //     ['createdAt', 'DESC']
    //   ]
    // })
    //   .then(orders => {
    //     const orderDate = orders.map(orders => orders.toJSON())
    //     console.log('orderdata', orderDate)
    //     return res.render('orderingrest', { orders: orderDate })
    //   })
  },
  getOrderPage: (req, res, next) => {
    const orderId = req.params.id
    Order.findByPk(orderId, {
      include: [
        {
          model: Restaurant,
          include: [{
            model: Meal
          }]
        }]
    })
      .then(order => {
        if (!order) throw new Error("此餐廳不存在！")

        const restaurant = order.Restaurant ? order.Restaurant : []
        const meals = order.Restaurant.Meals ? order.Restaurant.Meals : []

        const mealsData = meals.map(meals => meals.toJSON())

        return res.render('orderpage', { order: order.toJSON(), restaurant: restaurant.toJSON(), meals: mealsData })
      })
      .catch(err => next(err))
  },
  postOrdering: async (req, res, next) => {
    let { name, employeeId } = req.body

    try {
      const orderId = req.params.id;

      const order = await Order.findByPk(orderId)
      if (!order) throw new Error("此餐廳不存在！")

      const restId = order.restaurantId;

      const restaurant = await Restaurant.findByPk(restId, {
        include: [Meal]
      });
      if (!restaurant) throw new Error('Restaurant not found')

      const orderItems = []
      let totalPrice = 0

      // forEach所有餐點
      restaurant.Meals.forEach(meal => {
        const quantity = Number(req.body[`quantity_${meal.id}`])
        const description = req.body[`description_${meal.id}`] || ''

        if (quantity && quantity > 0) {
          const mealtotal = meal.price * quantity
          totalPrice += mealtotal

          orderItems.push({
            mealsname: meal.meals,
            price: meal.price,
            quantity,
            description,
            mealtotal
          })
        }
      })

      const personalorder = await Personalorder.create({
        name: req.user.name,
        employeeId: req.user.employeeId,
        totalprice: totalPrice,
        orderId: orderId,
        userId: req.user.id,
        restaurantName: restaurant.name
      })

      const mealorderData = orderItems.map(item => ({
        meals: item.mealsname,
        price: item.price,
        quantity: item.quantity,
        description: item.description,
        mealtotal: item.mealtotal,
        personalorderId: personalorder.id,
        orderId: orderId,
        name: name,
        employeeId: employeeId,
        restaurantName: restaurant.name
      }));

      await Mealorder.bulkCreate(mealorderData)



      req.flash('success_messages', '訂餐成功！')
      res.redirect(`/orderpage/${orderId}`)

    } catch (err) {
      next(err);
    }
  },
  getOrderInfo: async (req, res, next) => {
    const orderId = req.params.id

    try {
      const [mealsitem, mealsitemEachperson, mealsdescription, order] = await Promise.all([
        // 計算每個產品的數量
        Mealorder.findAll({
          where: {
            orderId
          },
          attributes: [
            'meals',
            'price',
            [sequelize.fn('SUM', sequelize.col('quantity')), 'total_sold']
          ],
          group: ['meals'],
          raw: true,
          nest: true
        }),
        // 計算每個人買個產品的購買數量
        Mealorder.findAll({
          where: {
            orderId
          },
          attributes: [
            'name',
            'meals',
            [sequelize.fn('SUM', sequelize.col('quantity')), 'personal_quantity']
          ],
          group: ['name', 'meals'],
          raw: true,
          nest: true
        }),
        // 查詢每個用戶的訂餐跟說明
        Mealorder.findAll({
          where: {
            orderId
          },
          attributes: [
            'name',
            'meals',
            'description',
          ],
          raw: true,
          nest: true
        }),
        // 透過訂單編號查詢是否開啟訂餐與後續使用餐廳資料
        Order.findByPk(orderId, {
          include: [Restaurant],
          raw: true,
          nest: true
        })
      ])

      // 透過每個產品的數量和單品價個計算訂單總金額
      const totalprice = mealsitem.reduce((acc, item) => {
        const itemprice = item.price * item.total_sold;
        return acc + itemprice;
      }, 0)

      // 取得餐廳資料
      const Rest = order.Restaurant

      res.render('orderinfo', { mealsitem, mealsitemEachperson, mealsdescription, Rest, totalprice, orderId, order })
    }
    catch (err) {
      next(err)
    }
  },
}
module.exports = orderController