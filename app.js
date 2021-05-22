const express = require('express')
const bodyParser = require("body-parser")

const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')
const HttpError = require('./Models/http-error')
const mongoose = require('mongoose')

const app = express()

app.use(bodyParser.json())

app.use((req, res, next)=>{
    res.setHeader('AccessControlAllowOrigin','*')
    res.setHeader('AccessControlAllowHeaders','Origin, X-Requested-Width, Content-Type, Accept, Authorization')
    res.setHeader('AccessControlAllowMethods','GET, POST, PATCH, DELETE')
})

app.use('/api/places',placesRoutes)
app.use('/api/users',usersRoutes)

app.use((req,res,next)=>{
    const error = new HttpError('Route not found',404)
    throw error
})

app.use((error,req,res,next)=>{
    if (res.headerSent) {
        return next(error)
    }
    res.status(error.code || 500)
    .json({message:error.message||'Unknown error'})
})

app.listen(5000)

const connectionStringLocal= 'mongodb://localhost:27017/products_test'
const connectionStringAtlas = 'mongodb+srv://gruningzen:Esfera3010@cluster0.uo1tr.mongodb.net?retryWrites=true&w=majority' 

mongoose
   // .connect('mongodb+srv://gruningzen:Esfera3010@cluster0.uo1tr.mongodb.net/places?retryWrites=true&w=majority')
   .connect(
    connectionStringAtlas, {
        dbName:'mern',
        useNewUrlParser: true,
        useUnifiedTopology: true
    }) 
   .then(()=>{
        console.log('listening to port 5000')
    })
    .catch(err=>
        console.log(err)
     )
