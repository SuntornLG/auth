const jwt = require('jsonwebtoken');

module.exports = function(req, res, next){

    const token = req.header('bearer');
    if(!token) return res.status(401).send('Access Denied');

    try{
        //Verify secret key
        const verifyed = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verifyed;
        next();
    }catch(err){
       res.status(400).send('Invalid Token');
    };
}