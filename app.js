const express=require("express");
const route=require("./route.js")
const cors=require("cors")
const app=express();
const Login=require("./login")
const dotenv=require("dotenv")
dotenv.config({path:"./config.env"});
const port=process.env.port;


app.use(express.json())
app.use(cors({
    origin:"https://localhost:4000",
    credentials:true
}))
app.use(route)
app.use('/uploads', express.static('uploads'));




    
  
            
  
  
  
  
  

app.listen(port,()=>{
    console.log("server on")
})

