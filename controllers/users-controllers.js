const DUMMY_USERS=[{
    id: 'u1',
    name: 'Albert',
    email: 'alberto.gruning.zen@gmail.com',
    password: 'test'
}]

const getUsers=(req,res,next)=>{
    res.json({users: DUMMY_USERS})
}

const signup= (req,res,next)=>{}

const login= (req,res,next)=>{}

exports.getUsers= getUsers
exports.signup= signup
exports.login= login

