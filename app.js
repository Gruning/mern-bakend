const express = require('express')
const bodyParser = require("body-parser")

const placeRoutes = require('./routes/places-routes')

const app = express()

app.use('/api/places',placeRoutes)

app.use((error,req,res,next)=>{
    if (res.headerSent) {
        return next(error)
    }
    res.status(error.code || 500)
    .json({message:error.message||'Unknown error'})
})

app.listen(5000)

//console.clear()  
console.log('listening to port 5000')