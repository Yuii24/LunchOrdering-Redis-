const express = require('express')
const router = express.Router()

const { authenticatedAdmin } = require('../../middlewares/auth')

const adminController = require('../../controllers/admin-controller')

router.get('/allorders', authenticatedAdmin, adminController.getAllOrders)

router.get('', (req, res) => res.redirect('/admin/allorders'))

module.exports = router