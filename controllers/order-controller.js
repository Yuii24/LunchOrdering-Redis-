const { Order } = require('../models')

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
  }
}

module.exports = orderController