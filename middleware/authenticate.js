const jwt = require("jsonwebtoken");
const User = require("../models/user");
const secretKey = "mirzaruhulnazirhussain12345678910";

const authenticate = async(req,res,next)=>{
    try {
        const token = req.headers.authorization
        
        const verifyToken = jwt.verify(token,secretKey);
        
        const mainUser = await User.findOne({_id:verifyToken._id})
        
        if(!mainUser){
            throw new Error ("user not found")
        }
        req.token = token
        req.mainUser = mainUser
        req.userId= mainUser._id

        next();
    } catch (error) {
        res.status(404).json({status:404,message:"unauthorized token"})
    }
}

module.exports = authenticate