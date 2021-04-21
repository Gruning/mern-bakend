const { v4: uuidv4 } = require('uuid')
const HttpError = require('../Models/http-error')

const DUMMY_USERS=[{
    id: 'u1',
    name: 'Albert',
    email: 'alberto.gruning.zen@gmail.com',
    password: 'test'
}]

const getUsers=(req,res,next)=>{
    res.json({users: DUMMY_USERS})
}

const signup= (req,res,next)=>{
    const {name,email,password} = req.body
   
    const hasUser =DUMMY_USERS.find(x=>x.email===email)

    if(hasUser) throw new HttpError('User already exists',422)
    
    const createdUser ={
        id: uuidv4(),
        name,
        email,
        password
    }
    DUMMY_USERS.push(createdUser)

    res.status(201).json({user: createdUser})
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

