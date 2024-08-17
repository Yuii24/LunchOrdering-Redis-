const express = require('express')
const router = express.Router()

const admin = require('./modules/admin')
const { authenticated } = require('../middlewares/auth')

const passport = require('../config/passport')

const orderController = require('../controllers/order-controller')
const userController = require('../controllers/user-controller')

const { generalErrorHandler } = require('../middlewares/error-handler')

router.use('/admin', admin)


router.get('/signup', userController.signUpPage)
router.post('/signup', userController.createUser)

router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)

router.get('/logout', userController.logout)

router.get('/ordering', authenticated, orderController.createOrder)
router.post('/ordering', authenticated, orderController.postOrder)
router.get('/user/orders', authenticated, userController.getOrders)

router.get('/', (req, res) => {
  res.redirect('/ordering')
})

router.use('/', generalErrorHandler)

module.exports = router
