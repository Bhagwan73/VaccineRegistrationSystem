const {isValidObjectId} =require("mongoose");
const userModel = require("../models/userModel");
const { verify } = require("jsonwebtoken");
require("dotenv").config({path:".env"})


exports.adminAuthentication=(req, res , next)=>{
    try{
        let token=req.headers.authorization
        if (!token || typeof token !== "string") return res.status(400).send({ status: false, message:'Authorization token is missing.' });
         token=token.split(" ")[1]  // Remove the "Bearer" word from token
        // Verify the token using the SECRET_KEY 
        verify(token,process.env.JWT_SECRET ,(err,decodedToken)=>{
            if(err)  return res.status(401).send({ status: false, message: err.message});
            req["adminId"]=decodedToken.adminId  // set adminId in the request object 
            next()
        })
    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}


exports.adminAuthorisation=async (req,res,next)=>{
    try {
    // take the adminId from the request parameters.
    const {adminId}=req.params

    // validate the adminId format.
    if(!isValidObjectId(adminId)) return res.status(400).send({status:false,message:"Invalid adminId"})
    
    // find admin by Id
    const admin=await userModel.findOne({_id:adminId,isAdmin:true})
    if(!admin) return res.status(401).send({status:false,messaage:"Admin not found."})

    // check request adminId matches the authenticated adminId.
    if(req.adminId!==adminId) return res.status(403).send({sattus:false,message:"Unauthorized access"})
    // call next function
    next()
    } catch (err) {
        return res.status(500).send({status:false,message:err.message})
    }
}