const express = require('express')
const router = express.Router()

const admin = require('./modules/admin')
const { authenticated } = require('../middlewares/auth')
const { authenticatedAdmin } = require('../middlewares/auth')

const passport = require('../config/passport')

const orderController = require('../controllers/order-controller')
const userController = require('../controllers/user-controller')

const { generalErrorHandler } = require('../middlewares/error-handler')

router.use('/admin', admin)


router.get('/signup', authenticatedAdmin, userController.signUpPage)
router.post('/signup', authenticatedAdmin, userController.createUser)

router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)

router.get('/logout', userController.logout)


router.get('/orderingrest/:id/info', authenticated, orderController.getOrderInfo)
router.get('/orderingrest', authenticated, orderController.getOrderingRest)
router.get('/orderpage/:id', authenticated, orderController.getOrderPage)
router.post('/orderpage/:id', authenticated, orderController.postOrdering)

router.get('/user/orders', authenticated, userController.getOrders)
router.delete('/user/order/:id', authenticated, userController.deleteOrder)

router.get('/user/order/:id', authenticated, userController.getOrder)
router.get('/user/order/:id/edit', authenticated, userController.editOrder)
router.patch('/user/order/:id', authenticated, userController.patchMeal)
router.delete('/user/mealorder/:id', authenticated, userController.deleteMeal)

// router.get('/ordering', authenticated, orderController.createOrder)
// router.post('/ordering', authenticated, orderController.postOrder)

router.get('/', (req, res) => {
  res.redirect('/orderingrest')
})

router.use('/', generalErrorHandler)

module.exports = router
