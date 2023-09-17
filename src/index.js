
const express=require("express")
const mongoose=require("mongoose")
const routes=require("./routes/router")
const app=express()
require("dotenv").config({path:".env"})

app.use(express.json())

mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("MongoDB is connected"))
.catch((err)=>console.log(err))

app.use("/",routes)

const PORT=process.env.PORT || 3001
app.listen(PORT,()=>{
    console.log(`Express running on port ${PORT}`)
})



