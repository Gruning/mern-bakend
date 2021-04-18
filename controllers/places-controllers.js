const { v4: uuidv4 } = require('uuid')


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

const getPlaceByUserId = (req,res,next)=>{
    const userId = req.params.uid
    const place = DUMMY_PLACES.find(x => x.creator === userId)
    if(!place){
        throw new HttpError('Place for provided user not found',404) 
    }
    res.json({place})
}

const createPlace = (req, res, next)=>{
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
    const placeId = req.params.pid

    const updatedPlace = { ...DUMMY_PLACES.find(x=>x.id === placeId)}
    const placeIndex = DUMMY_PLACES.findIndex(x=>x.id === placeId)

    updatedPlace.title= title
    updatedPlace.description= description

    res.status(200).json({place:updatedPlace})
}
const deletePlace = (req,res,next)=>{ 

}

exports.getPlaceById= getPlaceById
exports.getPlaceByUserId= getPlaceByUserId
exports.createPlace= createPlace
exports.updatePlace= updatePlace
exports.deletePlace= deletePlace


