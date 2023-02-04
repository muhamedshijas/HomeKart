const mongoose = require("mongoose")

const orderItemSchema= new mongoose.Schema({
quantity:{
    type:Number
},
product:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'ProductModel'
}
  
});

const  orderModel = mongoose.model('orderItems', orderItemSchema);
module.exports=orderItemsModel;