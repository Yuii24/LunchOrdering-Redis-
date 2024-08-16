const { Order } = require('../models')

const orderController = {
  createOrder: (req, res, next) => {
    res.render('ordering')
  },
  postOrder: (req, res, next) => {
    const { name, employeeId, description } = req.body
    
    if (!name) throw new Error('請輸入姓名')
    if (!employeeId) throw new Error('請輸入員工編號')
    if (!description) throw new Error('你的訂單是空白的喔...')

    return Order.create({
      name,
      employeeId,
      description
    })
      .then(() => res.redirect('/ordering'))
      .catch(err => next(err))
  }
}

module.exports = orderController