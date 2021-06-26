const HttpError = require('../Models/http-error')
const User = require('../Models/user')
const {validationResult}= require('express-validator')
const bcrypt = require('bcryptjs')

const getUsers= async (req,res,next)=>{
    let users
	
		try{
				users= await User.find({},'-password')
		} catch(err){
				const error= new HttpError('Could not fetch users',500)
				return next(error)
		}
		
		res.json({users: users.map(user=> user.toObject({getters: true}))})
}

const signup= async (req,res,next)=>{
    const errors= validationResult(req)

    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs',422))
    }
    const {name,email,password} = req.body
  
    
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

    let hashedPassword
    try {
        hashedPassword= await bcrypt.hash(password,12)
    } catch (err) {
       const error = new HttpError('Could not create user with given password',500)
       return next(error)
    }


    const createdUser = new User({
        name, 
        email, 
        image:req.file.path,//'https://live.staticflickr.com/7631/26849088292_36fc52ee90_b.jpg', 
        password: hashedPassword,
        places:[]
    })

    try {
        await createdUser.save()
    } catch (err) {
        const error = new HttpError('Registering user failed',500)
        return next(error)
    }
    let token
    try {
    token = jwt.sign(
        {userId:createdUser.id, email:createdUser.email},
        'supersecret_dont_share',
        {expiresIn:'1h'}        
        )
        
    } catch (err) {
       const error = new HttpError('Token error, try again later',500)
       return next(error)
        
    }


    res
        .status(201)
        .json({userId:createdUser.id, email:createdUser.email, token:token})
}

const login= async (req,res,next)=>{
    const {email,password} =req.body
    
	  let existingUser
    
    try{
        existingUser= await User.findOne({email:email})
    } catch(err){
        const error= new HttpError('Error searching for registered users',500)
        return next(error)
    }

	 if(!existingUser){
			  const error= new HttpError('Invalid credentials',401)
		 	  return next(error)
	 }
     let isValidPassword = false
     try {
        isValidPassword = await bcrypt.compare(password, existingUser.password)
     } catch (err) {
        const error= new HttpError('Error maching the password, try again',500)
        return next(error)
     }

    if (!isValidPassword) {
        const error= new HttpError('Invalid credentials',401)
        return next(error)
    }

   res.json({
       message:'Logged in!', 
       user: existingUser.toObject({getters:true})
    }) 
}

exports.getUsers= getUsers
exports.signup= signup
exports.login= login

