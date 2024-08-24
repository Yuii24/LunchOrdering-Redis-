const express = require('express')
const router = express.Router()

const { authenticated } = require('../../middlewares/auth')
const { authenticatedAdmin } = require('../../middlewares/auth')

const adminController = require('../../controllers/admin-controller')


router.get('/restaurants/create', authenticated, adminController.createRestaurants)
router.get('/restaurants/:id', authenticated, adminController.getRestaurant)
router.get('/restaurants/:id/edit', authenticated, adminController.editRestaurant)
router.get('/restaurants', authenticated, adminController.getRestaurants)
router.put('/restaurants/:id', authenticated, adminController.putRestaurant)
// 
router.post('/newrestaurantsorder/:id', authenticated, adminController.openOrder)
router.get('/newrestaurantsorder/:id', authenticated, adminController.getNewRestOrder)
// 
router.post('/restaurants', authenticated, adminController.psotRestaurants)
router.delete('/meals/:id', authenticated, adminController.deleteMeal)

router.patch('/closeorder/:id', authenticated, adminController.closeOrder)
router.patch('/reopenorder/:id', authenticated, adminController.reopenOrder)


// router.get('/allorders', authenticated, adminController.getAllOrders)
// router.get('/dailyorder/:date', authenticated, adminController.getDailyOrder)

router.get('', (req, res) => res.redirect('/admin/restaurants'))

module.exports = router