const { Order, User, Restaurant, Meal, Personalorder, Mealorder } = require('../models')
const { sequelize } = require('../models')
const { Op } = require('sequelize');
const bcrypt = require('bcrypt')

const userController = {
  signInPage: (req, res, next) => {
    return res.render('signin')
  },
  signIn: (req, res, next) => {
    req.flash('success_messages', '登入成功!')
    res.redirect('/')
  },
  logout: (req, res, next) => {
    req.flash('success_messages', '登出成功!')
    req.logout()
    res.redirect('/signin')
  },
  signUpPage: (req, res, next) => {
    return res.render('signup')
  },
  createUser: (req, res, next) => {
    const { name, employeeId, email, password, passwordCheck } = req.body
    if (!name) throw new Error('請輸入姓名')
    if (!employeeId) throw new Error('請輸入員工編號')
    if (!email) throw new Error('請輸入員工信箱')
    if (!password) throw new Error('請輸入密碼')
    if (password !== passwordCheck) throw new Error('兩次密碼並不相等')

    User.findOne({
      where: {
        [Op.or]: [
          { employeeId: employeeId },
          { email: email }
        ]
      }
    })
      .then(user => {
        if (user) {
          if (user.employeeId === Number(employeeId)) throw new Error('這位員工已經註冊')
          if (user.email === email) throw new Error('這個信箱已經被使用')
        }

        return bcrypt.hash(password, 10)
          .then(hash => User.create({
            name,
            employeeId,
            email,
            password: hash
          }))
          .then(() => {
            req.flash('success_messages', '註冊成功')
            res.redirect('signin')
          })
          .catch(err => next(err))
      })
      .catch(err => next(err))
  },
  getOrders: (req, res, next) => {
    const userId = req.user.id

    Personalorder.findAll({
      where: {
        userId: userId
      },
      order: [
        ['createdAt', 'DESC']
      ],
      timezone: '+08:00',
      raw: true,
      nest: true
    })
      .then((porders) => {
        if (!porders) throw new Error("訂單不存在")

        porders = porders.map(porder => {
          const date = new Date(porder.createdAt)
          const year = date.getFullYear() - 1911
          const month = date.getMonth() + 1
          const day = date.getDate()
          const formattedDate = `${year}年${month}月${day}日`

          console.log('date', date)

          return {
            ...porder,
            formattedDate
          }
        })
        console.log('orders', porders)
        return res.render('user/orders', { porders })
      })
      .catch(err => next(err))
    // sequelize.query("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", { replacements: [userId], type: sequelize.QueryTypes.SELECT })
    //   .then((orders) => {
    //     orders = orders.map(order => {
    //       const date = new Date(order.created_at)
    //       const year = date.getFullYear() - 1911
    //       const month = date.getMonth() + 1
    //       const day = date.getDate()
    //       const formattedDate = `${year}年${month}月${day}日`

    //       return {
    //         ...order,
    //         description: order.description.substring(0, 50),
    //         formattedDate
    //       }
    //     })
    //     return res.render('user/orders', { orders })
    //   })
    //   .catch(err => next(err))



    // return Order.findAll({
    //   raw: true,
    //   nest: true
    // })
    //   .then((orders) => {
    //     orders = orders.map(order => {
    //       const date = new Date(order.createdAt)
    //       const year = date.getFullYear() - 1911
    //       const month = date.getMonth() + 1
    //       const day = date.getDate()
    //       const formattedDate = `${year}年${month}月${day}日`
    //       return {
    //         ...order,
    //         formattedDate
    //       }
    //     })

    //     console.log('orders', orders)
    //     return res.render('user/orders', { orders })
    //   })
    //   .catch(err => next(err))
  },
  getOrder: async (req, res, next) => {
    const poId = req.params.id

    try {
      let personalorder = await Personalorder.findByPk(poId, {
        raw: true,
        nest: true,
      })

      const date = new Date(personalorder.createdAt)
      const year = date.getFullYear() - 1911
      const month = date.getMonth() + 1
      const day = date.getDate()
      const formattedDate = `${year}年${month}月${day}日`

      personalorder = { ...personalorder, formattedDate }


      const mealorder = await Mealorder.findAll({
        where: {
          personalorderId: poId
        },
        raw: true,
        nest: true
      })

      if (!mealorder) throw new Error("此訂單不存在")

      res.render('user/order', { mealorder, personalorder })
    }
    catch (err) {
      next(err)
    }
  },
  /*
    const orderId = req.params.id
    Order.findByPk(orderId, { raw: true })
      .then(order => {
        if (!order) throw new Error("此訂單不存在")
 
        res.render('user/order', { order })
      })
      .catch(err => next(err))*/
  editOrder: (req, res, next) => {
    /*
    const orderId = req.params.id
    Order.findByPk(orderId, { raw: true })
      .then(order => {
        if (!order) throw new Error("此訂單不存在")

        res.render('user/edit-order', { order })
      })
      .catch(err => next(err))
*/  },
  putOrder: (req, res, next) => {
    /*
    const orderId = req.params.id
    const { name, employeeId, description } = req.body
    console.log('訂餐內容', description)
    // Order.findByPk(orderId)
    //   .then(order => {
    //     if (!order) throw new Error("此訂單不存在")

    //     return order.update({
    //       name,
    //       employeeId,
    //       description
    //     })
    //   })
    //   .then(() => {
    //     req.flash('success_messages', '訂單更新成功')
    //     res.redirect(`/user/order/${orderId}`)
    //   })
    //   .catch(err => next(err))
*/  },
  getOrderingRest: (req, res, next) => {

    //   Restaurant.findAll({
    //     raw: true,
    //     nest: true
    //   })
    //     .then(restaurants => {
    //       return res.render('orderingrest', { restaurants })
    //     })
  },
}

module.exports = userController