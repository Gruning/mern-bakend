const { v4: uuidv4 } = require('uuid')
const { validationResult } = require('express-validator')

const HttpError = require('../Models/http-error')

let DUMMY_PLACES = [{
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

const getPlaceById =(req,res,next)=>{
    const placeId = req.params.pid
    const place = DUMMY_PLACES.find(x => x.id === placeId)

    if(!place){
        throw new HttpError('Place not found',404)
    } 

    res.json({place})
}

const getPlacesByUserId = (req,res,next)=>{
    const userId = req.params.uid
    const places = DUMMY_PLACES.filter(x => x.creator === userId)
    if(!places || places.length === 0){
        throw new HttpError('No places found for provided user',404) 
    }
    res.json({places})
}

const createPlace = (req, res, next)=>{
    const errors= validationResult(req)
    if (!errors.isEmpty()) { 
        console.log(errors)
        throw new HttpError('Invalid inputs',422)
    }
    const {title, description,coordinates, address, creator}= req.body

  const createdPlace= {
    id:uuidv4(), 
    title,
    description,
    location: coordinates,
    address,
    creator
  }

  DUMMY_PLACES.push(createdPlace)

  res.status(201).json({place: createdPlace})

}
const updatePlace = (req,res,next)=>{
    const {title, description}= req.body
    const errors= validationResult(req)
    if (!errors.isEmpty()) { 
        throw new HttpError('Invalid inputs',422)
    }
    const placeId = req.params.pid

    const updatedPlace = { ...DUMMY_PLACES.find(x=>x.id === placeId)}
    const placeIndex = DUMMY_PLACES.findIndex(x=>x.id === placeId)

    updatedPlace.title= title
    updatedPlace.description= description

    res.status(200).json({place:updatedPlace})
}
const deletePlace = (req,res,next)=>{ 
    const placeId = req.params.pid

    if(!DUMMY_PLACES.find(x => x.id === placeId)){
        throw new HttpError('No places found for this id')
    }

    DUMMY_PLACES = DUMMY_PLACES.filter(x=>x.id!== placeId)

    res.status(200).json({message:'deleted'})
}

exports.getPlaceById= getPlaceById
exports.getPlacesByUserId= getPlacesByUserId
exports.createPlace= createPlace
exports.updatePlace= updatePlace
exports.deletePlace= deletePlace


