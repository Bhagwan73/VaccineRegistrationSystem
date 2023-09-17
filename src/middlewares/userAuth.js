const {isValidObjectId} =require("mongoose");
const userModel = require("../models/userModel");
const { verify } = require("jsonwebtoken");
require("dotenv").config({path:".env"})

exports.userAuthentication=(req, res , next)=>{
    try{
        let token=req.headers.authorization
        if (!token || typeof token !== "string") return res.status(400).send({ status: false, message:'Authorization token is missing.' });
         token=token.split(" ")[1]  // Remove the "Bearer" word from token
        // Verify the token using the SECRET_KEY 
        verify(token,process.env.JWT_SECRET ,(err,decodedToken)=>{
            if(err)  return res.status(401).send({ status: false, message: err.message});
            req["userId"]=decodedToken.userId  // set userId in the request object 
            next()
        })
    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}


exports.userAuthorisation=async (req,res,next)=>{
    try {
    // take the userId from the request parameters.
    const {userId}=req.params

    // validate the adminId format.
    if(!isValidObjectId(userId)) return res.status(400).send({status:false,message:"invalid userId"})
    const user=await userModel.findById(userId)
    if(!user) return res.status(404).send({status:false,message:"User not found"})

    // check request userId matches the authenticated userId.
    if(req.userId!==userId) return res.status(403).send({sattus:false,message:"Unauthorized access"})
    next()
    } catch (err) {
        return res.status(500).send({status:false,message:err.message})
    }
}