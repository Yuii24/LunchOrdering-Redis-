const express = require('express')
const router = express.Router()

const orderController = require('../controllers/order-controller')

const { generalErrorHandler } = require('../middlewares/error-handler')


router.get('/ordering', orderController.createOrder)
router.post('/ordering', orderController.postOrder)

router.get('/', (req, res) => {
  res.redirect('/ordering')
})

router.use('/', generalErrorHandler)

module.exports = router
