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
  getOrders: async (req, res, next) => {
    const userId = req.user.id
    const employeeId = req.user.employeeId
    try {
      let porders = await Personalorder.findAll({
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

      // const personalorder = await Personalorder.findOne({
      //   where: {
      //     personalorderId: porders.id,
      //     employeeId: employeeId
      //   },
      //   attributes: [
      //     [sequelize.fn('SUM', sequelize.col('mealtotal')), 'total_price']
      //   ],
      //   raw: true,
      //   nest: true
      // })
      const pordersid = porders.map(order => order.id)
      console.log('porders', porders)
      console.log('porders.id', pordersid)
      return res.render('user/orders', { porders })
    } catch (err) {
      next(err)
    }
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

      const totalprice = await Mealorder.findOne({
        where: {
          personalorderId: poId
        },
        attributes: [
          [sequelize.fn('SUM', sequelize.col('mealtotal')), 'totalprice']
        ],
        raw: true,
        nest: true
      })

      if (!mealorder) throw new Error("此訂單不存在")

      res.render('user/order', { mealorder, personalorder, totalprice })
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
  editOrder: async (req, res, next) => {
    const mealorderId = req.params.id

    try {
      const meals = await Mealorder.findByPk(mealorderId, {
        raw: true,
        nest: true
      })

      console.log('meals', meals)

      res.render('user/editorder', { meals })

    } catch (err) {
      next(err)
    }
    /*
    
    Order.findByPk(orderId, { raw: true })
      .then(order => {
        if (!order) throw new Error("此訂單不存在")

        res.render('user/edit-order', { order })
      })
      .catch(err => next(err))
*/  },
  patchMeal: async (req, res, next) => {
    const mealorderId = req.params.id
    const { quantity, description } = req.body

    try {
      const mealorder = await Mealorder.findByPk(mealorderId)

      if (!mealorder) throw new Error('餐點並不存在')

      const totalprice = mealorder.price * quantity

      console.log('mealorder', mealorder)
      console.log('totalprice', totalprice)


      await mealorder.update({
        quantity,
        description,
        mealtotal: totalprice
      })

      req.flash('success_messages', '餐點變更成功!')
      return res.redirect(`/user/order/${mealorder.personalorderId}`)
    } catch (err) {
      next(err)
    }

  },
  deleteMeal: async (req, res, next) => {
    const mealorderId = req.params.id

    try {
      const mealorder = await Mealorder.findByPk(mealorderId, {
        include: [Personalorder]
      })

      if (!mealorder) throw new Error('此訂單並不存在!')

      const poId = mealorder.Personalorder.id

      await mealorder.destroy()

      const mealorderAfter = await Mealorder.findOne({
        where: {
          personalorderId: poId
        }
      })

      if (!mealorderAfter) {
        const personalorderAfter = await Personalorder.findByPk(poId)
        if (personalorderAfter) {
          await personalorderAfter.destroy()
          req.flash('success_messages', '餐點刪除成功!')
          return res.redirect(`/user/orders`)
        }
      }
      req.flash('success_messages', '餐點刪除成功!')
      return res.redirect(`/user/order/${poId}`)
    } catch (err) {
      next(err)
    }
  },
  deleteOrder: async (req, res, next) => {
    const poId = req.params.id

    try {
      const personalorder = await Personalorder.findByPk(poId)

      if (!personalorder) throw new Error('此訂單並不存在!')

      await personalorder.destroy()
      req.flash('success_messages', '訂單刪除成功!')
      res.redirect('/user/orders')
    } catch (err) {
      next(err)
    }
  }
}

module.exports = userController