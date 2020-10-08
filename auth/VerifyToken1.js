var jwt = require('jsonwebtoken');
var config = require('../configs');
const User1=require('../models/userdetail')
function verifyToken1(req, res, next) {
  // console.log(req)
  // var token = req.body.headers['x-access-token'];
  var token = req.headers['x-access-token'];
  if (!token)
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  jwt.verify(token, config.secret, function(err, decoded) {
    if (err)
    return res.status(500).send({ auth: false, message: 'Failed to authenticate token.',value:0 });
    // if everything good, save to request for use in other routes
    else{
    req.userId = decoded.id;
    User1.findOne({_id:decoded.id},(err,user)=>{
        if(err)
        {    
        	return res.status(500).send({ auth: false, message: 'Failed to authenticate token.',value:0 });
        }
        else if(user.uploads>5)
        {
            res.json({status:422,msg:'Max upload limit reached , write a feedback to increase your uploading limit'})
        }
        else
        {
        req.user=user;
        next();
        }
    })
    }
})
}
module.exports = verifyToken1;