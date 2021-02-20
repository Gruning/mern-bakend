const express = require('express')
const bodyParser = require("body-parser")

const placeRoutes = require('./routes/places-routes')

const app = express()

app.use('/api/places',placeRoutes)

app.listen(5000)

//console.clear()  
console.log('listening to port 5000')