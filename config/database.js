const mongoose= require("mongoose");

module.exports.connect= async()=>{
    try{
        await mongoose.connect("mongodb://0.0.0.0:27017/product_db")
        console.log("success")
    }catch(err){
        console.log("failed")
    }
}
