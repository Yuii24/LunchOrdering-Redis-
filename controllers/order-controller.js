const { Order, User, Restaurant, Meal, Personalorder } = require('../models')
const { sequelize } = require('../models')
const { Op } = require('sequelize');
const bcrypt = require('bcrypt')

const orderController = {
  createOrder: (req, res, next) => {
    res.render('ordering')
  },
  postOrder: (req, res, next) => {
    const { name, employeeId, description } = req.body

    const categoryRegex = /\{(.+?)\}/
    const categoryMatch = description.match(categoryRegex);
    const category = categoryMatch ? categoryMatch[1] : '未分類'

    const menuItems = description.replace(categoryRegex, '').trim().split('\n');



    const OrderArray = menuItems.map(d => {
      const [c] = d.split('}').map(item => item.trim)
      const [n, p] = d.split(',').map(item => item.trim())
      return { n, p: Number(p) }
    })
    console.log('主題', category)
    console.log('訂餐內容', OrderArray)

    // if (!name) throw new Error('請輸入姓名')
    // if (!employeeId) throw new Error('請輸入員工編號')
    // if (!description) throw new Error('你的訂單是空白的喔...')

    // return Order.create({
    //   name,
    //   employeeId,
    //   description,
    //   userId: req.user.id
    // })
    //   .then(() => {
    //     req.flash('success_messages', '訂餐成功')
    //     res.redirect('/ordering')
    //   })
    //   .catch(err => next(err))
  },
  getOrderingRest: (req, res, next) => {
    Order.findAll({
      where: {
        isOpen: true
      },
      include: [Restaurant]
    })
      .then(orders => {
        console.log('order', orders)
        const orderDate = orders.map(orders => orders.toJSON())
        return res.render('orderingrest', { orders: orderDate })
      })
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

        console.log('meals', mealsData)

        return res.render('orderpage', { order: order.toJSON(), restaurant: restaurant.toJSON(), meals: mealsData })
      })
      .catch(err => next(err))
  },
  postOrdering: (req, res, next) => {
    const orderId = req.params.id
    console.log('orderId', orderId)
    let restId
    Order.findByPk(orderId)
      .then(order => {
        if (!order) throw new Error("此餐廳不存在！")
        console.log('restaurantId', order.restaurantId)

        restId = order.restaurantId

        Restaurant.findByPk(restId, {
          include: [Meal]
        })
          .then(restaurant => {
            if (!restaurant) throw new Error('Restaurant not found');

            const orderItems = [];
            let totalPrice = 0;

            // 遍历餐点
            restaurant.Meals.forEach(meal => {
              const quantity = Number(req.body[`quantity_${meal.id}`]);
              const description = req.body[`description_${meal.id}`] || '';

              if (quantity && quantity > 0) {
                const itemTotal = meal.price * quantity;
                totalPrice += itemTotal;

                orderItems.push({
                  mealId: meal.id,
                  quantity,
                  description,
                  itemTotal
                });
              }
            })

            console.log('restaurantId', restId)
            console.log('totalPrice', totalPrice)
            console.log('orderItems', orderItems)

            return Personalorder.create({
              name: req.user.name,
              employeeId: req.user.employeeId,
              totalprice: totalPrice,
              orderId: orderId,
              userId: req.user.id
            })
          })
      })
      .catch(err => next(err))
    /*
Restaurant.findByPk(restId, {
  include: [Meal]
})
  .then(restaurant => {
    if (!restaurant) throw new Error('Restaurant not found');

    const orderItems = [];
    let totalPrice = 0;

    // 遍历餐点
    restaurant.Meals.forEach(meal => {
      const quantity = Number(req.body[`quantity_${meal.id}`]);
      const description = req.body[`description_${meal.id}`] || '';

      if (quantity && quantity > 0) {
        const itemTotal = meal.price * quantity;
        totalPrice += itemTotal;

        orderItems.push({
          mealId: meal.id,
          quantity,
          description,
          itemTotal
        });
      }
    });

    console.log('restaurantId', restId)
    console.log('totalPrice', totalPrice)
    console.log('orderItems', orderItems)
 
        // 处理订单（假设你有一个 Order 模型）
        return Order.create({
          restaurantId,
          totalPrice,
          orderItems,  // 假设 Order 模型支持关联 orderItems
          userId: req.user.id  // 假设你有用户登录系统
        });
 
})
  .then(() => {
res.redirect('/user/orders');  // 假设这是你的订单列表页面
})
.catch(err => next(err))
*/
  }
}

module.exports = orderController