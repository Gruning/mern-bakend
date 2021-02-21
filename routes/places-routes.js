const express = require('express')

const router = express.Router()

const DUMMY_PLACES = [{
    id:'p1',
    title:'Empire State Building',
    description:'One famous building',
    location:{
        lat:40.7484474,
        lng:-73.9871516
    },
    address:'20 W 34 St, New York, NY10001',
    creator:'u1'
}]

router.get('/:pid',(req,res,next)=>{
    const placeId = req.params.pid
    const place = DUMMY_PLACES.find(x => x.id === placeId)

    if(!place) return res.status(404).json({message:`No places with id ${placeId}`})

    res.json({place})
})

router.get('/user/:uid',(req,res,next)=>{
    const userId = req.params.uid
    const place = DUMMY_PLACES.find(x => x.creator === userId)
    if(!place) return res.status(404).json({message:`No places with user id ${userId}`})
    res.json({place})
})

module.exports = router