const fs = require('fs')

const { v4: uuidv4 } = require('uuid')
const { validationResult } = require('express-validator')
const mongoose= require('mongoose')

const HttpError = require('../Models/http-error')
const getCoordsForAddress = require('../util/location')
const Place= require('../Models/place')
const User= require('../Models/user')

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

    //let places
    let userWhithPlaces
    try {
        userWhithPlaces = await User.findById(userId).populate('places')
        console.log(userWhithPlaces)
        console.log(userWhithPlaces.places)
      } catch (err) {
      const error= new HttpError('Fetching places failed',500)
      return next(error)
    } 
    
    //if(!places || places.length === 0){
    if(!userWhithPlaces.places || userWhithPlaces.places.length === 0){
        return next(new HttpError('No places found for provided user',404)) 
    }
    res.json({places: userWhithPlaces.places.map(place=> place.toObject({getters: true})) })
}

const createPlace = async (req, res, next)=>{
    const errors= validationResult(req)
    if (!errors.isEmpty()) { 
        console.log(errors)
        return next (new HttpError('Invalid inputs',422))
    }
    const {title, description, address }= req.body

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
        image:req.file.path,//'https://upload.wikimedia.org/wikipedia/commons/1/13/Empire_State_Building_mit_Weihnachtsbeleuchtung.JPG',
        creator: req.userData.userId
    })
    
    let user
    try{
        user= await User.findById(req.userData.userId)
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

    if (place.creator.toString() !== req.userData.userId) {
      const error = new HttpError('Not authorized to edit this place',401)
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
      place = await Place.findById(placeId).populate('creator') 
      console.log(place) 
    } catch (err) {
      const error = new HttpError('Error finding place',500)
      return next(error)
    }

    if(!place){
        const error= new HttpError('Place not found', 404)
        return next(error)
    }

    if (place.creator.id !== req.userData.userId) {
      const error = new HttpError('Not authorized to delete this place',401)
      return next(error)
    }
    const imagePath = place.image

    try {
      const sess= await mongoose.startSession()
        sess.startTransaction()
        await place.remove({session: sess})
        place.creator.places.pull(place)
        await place.creator.save({session: sess})
      await sess.commitTransaction() 

    } catch (err) {
      const error = new HttpError('Error deleting place',500)
      return next(error)
    }

    fs.unlink(imagePath,err => {
      console.log(err)
    })
    res.status(200).json({message:'deleted'})
}

exports.getPlaceById= getPlaceById
exports.getPlacesByUserId= getPlacesByUserId
exports.createPlace= createPlace
exports.updatePlace= updatePlace
exports.deletePlace= deletePlace


