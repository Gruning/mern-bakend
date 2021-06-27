module.exports = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]//Authorization:'bearer TOKEN'
    
}