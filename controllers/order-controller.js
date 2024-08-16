const { Order } = require('../models')

const orderController = {
  createOrder: (req, res, next) => {
    res.render('ordering')
  },
  postOrder: (req, res, next) => {
    throw new Error('错误消息');
    const { name, employeeId, description } = req.body
    console.log('name', name)

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