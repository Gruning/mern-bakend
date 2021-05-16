const { v4: uuidv4 } = require('uuid')
const HttpError = require('../Models/http-error')
const {validationResult}= require('express-validator')

const DUMMY_USERS=[{
    id: 'u1',
    name: 'Albert',
    email: 'alberto.gruning.zen@gmail.com',
    password: 'test'
}]

const getUsers=(req,res,next)=>{
    res.json({users: DUMMY_USERS})
}

const signup= async (req,res,next)=>{
    const errors= validationResult(req)

    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs',422))
    }
    const {name,email,password,places} = req.body
   
    let existingUser
    try{
        existingUser= await User.findOne({email:email})
    } catch(err){
        const error= new HttpError('Error searching for registered users',500)
        return next(error)
    }

    if(existingUser){
        const error = new HttpError('User exists, please login',422)
        return next(error)
    }

    const createdUser = new User({
        name, 
        email, 
        image:'https://live.staticflickr.com/7631/26849088292_36fc52ee90_b.jpg', 
        password,
        places
    })

    try {
        await createdUser.save()
    } catch (err) {
        const error = new HttpError('Registering user failed',500)
        return next(error)
    }
    res.status(201).json({user: createdUser.toObject({getters:true})})
}

const login= (req,res,next)=>{
    const {email,password} =req.body
    const identifietUser =DUMMY_USERS.find(x=>x.email===email)

    if(!identifietUser || identifietUser.password!== password) 
        throw new HttpError('Wrong credentials ',401)

   res.json({message:'Logged in!'}) 
}

exports.getUsers= getUsers
exports.signup= signup
exports.login= login

