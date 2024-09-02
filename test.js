const { Order, User, Restaurant, Meal, Personalorder, Mealorder } = require('./models')
const { sequelize } = require('./models')
const { Op } = require('sequelize');

const { client, connectRedis } = require('./helpers/redis-helper');


const orderId = 1

async function getOrderInfo() {

  try {
    const [meals, mealsitem, mealsitemEachperson, mealsdescription, order] = await Promise.all([
      Mealorder.findAll({
        where: {
          orderId
        },
        // attributes: [
        //   'meals',
        //   'price',
        // ],
        // group: ['meals'],
        raw: true,
        nest: true
      }),
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

    const total = meals.map(meal => meal.mealtotal).reduce((acc, price) => acc + price, 0)

    const mealsSummary = meals.reduce((acc, meal) => {
      const mealType = meal.meals; // 假设 meals 字段表示餐点的种类
      const quantity = meal.quantity; // 假设 quantity 字段表示每种餐点的数量
      const price = meal.price
      const mealPrice = meal.mealtotal; // 假设 mealtotal 表示餐点的总价
      const name = meal.name;

      // 如果 accumulator 中还没有该餐点的种类，则初始化为 {quantity: 0, totalPrice: 0}
      if (!acc[mealType]) {
        acc[mealType] = {
          quantity: 0,
          price: 0,
          totalPrice: 0,
          name: []
        };
      }

      // 累加当前餐点的数量和价格到对应的餐点种类上
      acc[mealType].quantity += quantity;
      acc[mealType].price = price;
      acc[mealType].totalPrice += mealPrice;
      acc[mealType].name.push(name)

      return acc;
    }, {});

    console.log('meals', meals)
    console.log('mealsSummary', mealsSummary)

    // const mealsSu = mealsSummary.map(item => )

    console.log('total', total)
    // console.log('orderinfo', { mealsitem, mealsitemEachperson, mealsdescription, Rest, totalprice, orderId, order })
  }
  catch (err) {
    next(err)
  }
}

getOrderInfo()
