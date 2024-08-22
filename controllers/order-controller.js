const { Order, User, Restaurant, Meal, Personalorder, Mealorder } = require('../models')
const { sequelize } = require('../models')
const { Op } = require('sequelize');
const bcrypt = require('bcrypt')

const orderController = {
  /*
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
  },*/
  getOrderingRest: (req, res, next) => {
    Order.findAll({
      where: {
        isOpen: true
      },
      include: [Restaurant]
    })
      .then(orders => {
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

      // 遍历餐点
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

    /*
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
                const mealtotal = meal.price * quantity;
                totalPrice += mealtotal;

                orderItems.push({
                  mealsname: meal.meals,
                  price: meal.price,
                  quantity,
                  description,
                  mealtotal
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
      */
  },
  getOrderInfo: async (req, res, next) => {
    const orderId = req.params.id

    try {
      const mealsitem = await Mealorder.findAll({
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
      })
      // console.log('personalorder', personalorder)
      console.log('mealsitem', mealsitem)

      const mealsitemEachperson = await Mealorder.findAll({
        where: {
          orderId
        },
        attributes: [
          'name',
          'meals',
          [sequelize.fn('SUM', sequelize.col('quantity')), 'total_sold']
          // [sequelize.fn('COUNT', sequelize.col('quantity')), 'quantity_ordered']
        ],
        group: ['name', 'meals'],
        raw: true,
        nest: true
      })

      const mealsdescription = await Mealorder.findAll({
        where: {
          orderId
        },
        attributes: [
          'name',
          'meals',
          'description',
          'restaurantName'
        ],
        group: ['meals', 'description'],
        raw: true,
        nest: true
      })

      const meals = await Mealorder.findOne({
        where: {
          orderId: orderId
        },
        attributes: [
          'restaurantName',
          [sequelize.fn('SUM', sequelize.col('mealtotal')), 'total_price']
        ],
        raw: true,
        nest: true
      })

      const Rest = await Restaurant.findOne({
        where: {
          name: meals.restaurantName
        },
        raw: true,
        nest: true
      })

      console.log('Rest', Rest)

      res.render('orderinfo', { mealsitem, mealsitemEachperson, mealsdescription, meals, Rest, orderId })
    }
    catch (err) {
      next(err)
    }
  },
}
module.exports = orderController