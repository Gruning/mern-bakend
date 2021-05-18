const { v4: uuidv4 } = require('uuid')
const { validationResult } = require('express-validator')
const mongoose= require('mongoose')

const HttpError = require('../Models/http-error')
const getCoordsForAddress = require('../util/location')
const Place= require('../Models/place')
const User= require('../Models/user')

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

const getPlaceById = async (req,res,next)=>{
    const placeId = req.params.pid
    let place
    try {
        place= await Place.findById(placeId)
    } catch (err) {
      const error = new HttpError('Error finding place',500)
      return next(error)
    }


    if(!place){
        const error= new HttpError('Place not found',404)
        return next(error)
    } 

    res.json({place: place.toObject({getters: true})})
}

const getPlacesByUserId = async(req,res,next)=>{
    const userId = req.params.uid
    //const places = DUMMY_PLACES.filter(x => x.creator === userId)
    
    let places 
    try {
      places= await Place.find({creator: userId})
    } catch (err) {
      const error= new HttpError('Fetching places failed',500)
      return next(error)
    } 
    
    if(!places || places.length === 0){
        return next(new HttpError('No places found for provided user',404)) 
    }
    res.json({places: places.map(place=> place.toObject({getters: true})) })
}

const createPlace = async (req, res, next)=>{
    const errors= validationResult(req)
    if (!errors.isEmpty()) { 
        console.log(errors)
        return next (new HttpError('Invalid inputs',422))
    }
    const {title, description, address, creator}= req.body

    let coordinates

    try {
        coordinates= await getCoordsForAddress(address)
    } catch (error) {
        return next(error)
    }

    const createdPlace= new Place({
        title,
        description,
        address,
        location: coordinates,
        image:'https://upload.wikimedia.org/wikipedia/commons/1/13/Empire_State_Building_mit_Weihnachtsbeleuchtung.JPG',
        creator
    })
    
    let user
    try{
        user= await User.findById(creator)
    }catch(err){
        const error= new HttpError('Error searching related user',500)
        return next(error) 
    }

    if(!user){
        const error= new HttpError('Related user not found', 500)
        return next(error)
    }

    try {
        const sess= await mongoose.startSession()
        sess.startTransaction()
        
        await createdPlace.save({session:sess})
        user.places.push(createdPlace)
        await user.save({session:sess})

        await sess.commitTransaction()
    } catch (err) {
        const error = new HttpError('Creating place failed',500)
        return next(error)
    }
  res.status(201).json({place: createdPlace})

}
const updatePlace = async (req,res,next)=>{
    const {title, description}= req.body
    const errors= validationResult(req)
    if (!errors.isEmpty()) { 
        return next(new HttpError('Invalid inputs',422))
    }
    const placeId = req.params.pid

    //const updatedPlace = { ...DUMMY_PLACES.find(x=>x.id === placeId)}
    //const placeIndex = DUMMY_PLACES.findIndex(x=>x.id === placeId)
    
    let place
    try {
      place = await Place.findById(placeId) 
    } catch (err) {
        const error = new HttpError('Error finding place for this id',500)
        return next(error)
    }

    place.title= title
    place.description= description
    
    try {
      await place.save()
    } catch (err) {
      const error = new HttpError('Error saving the updated place',500)
      return next(error)
    }
    
    res.status(200).json({place: place.toObject({getters: true})})
}
const deletePlace = async (req,res,next)=>{ 
    const placeId = req.params.pid
    let place
    try {
      place = await Place.findById(placeId) 
      console.log(place) 
    } catch (err) {
      const error = new HttpError('Error finding place',500)
      return next(error)
    }

    try {
      await place.remove()
    } catch (err) {
      const error = new HttpError('Error deleting place',500)
      return next(error)
    }
    res.status(200).json({message:'deleted'})
}

exports.getPlaceById= getPlaceById
exports.getPlacesByUserId= getPlacesByUserId
exports.createPlace= createPlace
exports.updatePlace= updatePlace
exports.deletePlace= deletePlace


