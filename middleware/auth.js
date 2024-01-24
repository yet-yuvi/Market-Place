const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader) {
        res.status(401).json({massage: "Unauthorize"});
        return;
    }
    //const token = authHeader.split(' ')[1];  //check
    const token = authHeader && authHeader.split(' ')[1];  //check
    if(!token) {
        res.status(401).json({massage: "Unauthorize"});
        return;
    }else {
        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {  //check
            if(err) {
                res.status(401).json({massage: "Unauthorize"});
                return;
            }else {
                req.user = payload;  //check
                next();
            }
        })
    }
}