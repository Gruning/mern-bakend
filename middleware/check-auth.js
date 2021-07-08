const jwt = require('jsonwebtoken');
const HttpError = require('../Models/http-error')

module.exports = (req, res, next) => {

    if(req.method === 'OPTIONS') return next()
    
    try {
        const token = req.headers.authorization.split(' ')[1]//Authorization:'Bearer TOKEN'
        if (!token) throw new Error(' No Token')
        const decodedToken = jwt.verify(token,'supersecret_dont_share')
        req.userData = {userId: decodedToken.userId}
        next()
    } catch (err) {
        const error = new HttpError(`Authentication Failed ${err}`,403)
        return next(error)
    }
}
