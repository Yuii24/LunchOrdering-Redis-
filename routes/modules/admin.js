const express = require('express')
const router = express.Router()

const { authenticatedAdmin } = require('../../middlewares/auth')

const adminController = require('../../controllers/admin-controller')


router.get('/restaurants/create', authenticatedAdmin, adminController.createRestaurants)
router.get('/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)
router.get('/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
router.get('/restaurants', authenticatedAdmin, adminController.getRestaurants)
router.put('/restaurants/:id', authenticatedAdmin, adminController.putRestaurant)
router.post('/restaurants/:id', authenticatedAdmin, adminController.openOrder)
router.post('/restaurants', authenticatedAdmin, adminController.psotRestaurants)
router.delete('/meals/:id', authenticatedAdmin, adminController.deleteMeal)

router.patch('/order/:id', authenticatedAdmin, adminController.closeOrder)

// router.get('/closeorder', authenticatedAdmin, adminController.getCloseOrder)


router.get('/allorders', authenticatedAdmin, adminController.getAllOrders)
router.get('/dailyorder/:date', authenticatedAdmin, adminController.getDailyOrder)

router.get('', (req, res) => res.redirect('/admin/restaurants'))

module.exports = router