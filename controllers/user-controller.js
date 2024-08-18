const { Order, User } = require('../models')
const { sequelize } = require('../models')
const { Op } = require('sequelize');
const bcrypt = require('bcrypt')

const userController = {
  signInPage: (req, res, next) => {
    return res.render('signin')
  },
  signIn: (req, res, next) => {
    req.flash('success_messages', '登入成功!')
    res.redirect('/ordering')
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
    sequelize.query('SELECT * FROM orders', { type: sequelize.QueryTypes.SELECT })
      .then((orders) => {
        orders = orders.map(order => {
          const date = new Date(order.created_at)
          const year = date.getFullYear() - 1911
          const month = date.getMonth() + 1
          const day = date.getDate()
          const formattedDate = `${year}年${month}月${day}日`
          return {
            ...order,
            formattedDate
          }
        })
        return res.render('user/orders', { orders })
      })
      .catch(err => next(err))
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
  getTest: (req, res, next) => {
    sequelize.query("SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS unique_date FROM orders GROUP BY unique_date", { type: sequelize.QueryTypes.SELECT })
      .then((test) => {
        console.log(test)
      })
      .catch(err => next(err))
  }
}

module.exports = userController