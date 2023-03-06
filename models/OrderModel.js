const mongoose = require("mongoose")

const orderSchema= new mongoose.Schema({
   orderItems:{
   type:Object
   },
   user:{
      type:String
   },
   address:{
    type:Object
   },
   status:{
    type:String,
    default:"pending"
   },
   totalPrice:{   
    type:Number
   },
   dateOrdered:{
    type:Date,
    default:new Date()
   },
   dateDelivered:{
      type:Date, 
      default: new Date(new Date().setDate(new Date().getDate() + 7))
   },
   userId:{
      type:String
   },
   quantity:{
      type:Number
   },
   paymentType:{
      type:String 
   },
   discount:{
      type:Number,
      default:0
   },
   return:{
      type:Boolean,
      default:false
   },
   cancel:{
      type:Boolean,
      default:false
   },
   returnStatus:{
      type:Boolean,
      default:false,
   },
   delivered:{
      type:Boolean,
      default:false
   }
});

const  OrderModel = mongoose.model('orders', orderSchema);
module.exports=OrderModel;
