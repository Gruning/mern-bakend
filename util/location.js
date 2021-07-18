const axios= require('axios')
const HttpError = require('../Models/http-error')
const API_KEY = process.env.GOOGLE_API_KEY
//const API_KEY ='AIzaSyDMdaDwaIBbcOr8SKXJRgf3MolOSEQAZEU'

async function getCoordinatesForAddress(address){
    //mock place
    //return {
    //   lat:40.9999999,
    //   lng:-73.9999999
    //}

    const response= await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}`)//&key=${API_KEY}`)

    const data = response.data
    if(data.status && data.status !=='OK'){
        const error= new HttpError(`${data.status} - ${data.status.error_message}`,422)
        throw error
    }
    if(!data || data.status ==='ZERO_RESULTS'){
        const error= new HttpError('No location for that address',422)
        throw error
    }

    const coordinates = data.results[0].geometry.location
    return coordinates
}

module.exports= getCoordinatesForAddress