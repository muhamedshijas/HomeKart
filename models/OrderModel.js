const mongoose = require("mongoose")

const orderSchema= new mongoose.Schema({
   orderItems:{
    type:String
   },
   address:{
    type:String
   },
   city:{
    type:String
   },
   phone:{
    type:String
   },
   status:{
    type:String,
    default:"pending"
   },
   totalPrice:{
    type:Number
   },
   user:{
    type:String
   },
   dateOrdered:{
    type:Date,
    default:Date.now
   }

});

const  OrderModel = mongoose.model('orders', orderSchema);
module.exports=OrderModel;
