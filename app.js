const express = require('express')
const bodyParser = require("body-parser")

const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/users-routes')
const HttpError = require('./Models/http-error')
const mongoose = require('mongoose')

const app = express()

app.use(bodyParser.json())

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

//console.clear() 
mongoose
    .connect('mongodb+srv://gruningzen:Esfera3010@cluster0.uo1tr.mongodb.net/places?retryWrites=true&w=majority')
    .then(()=>{
        console.log('listening to port 5000')
    })
    .catch()