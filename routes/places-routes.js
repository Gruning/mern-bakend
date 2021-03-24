const express = require('express')
const placesControllers = require('../controllers/places-controllers')
const HttpError = require('../Models/http-error')
const router = express.Router()

router.get('/:pid',placesControllers.getPlaceById)
router.get('/user/:uid',placesControllers.getPlaceByUserId)

module.exports = router