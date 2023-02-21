const mongoose = require("mongoose")
const mongoosePaginate=require('mongoose-paginate-v2')

const ProductSchema = new mongoose.Schema({
   name:String,
   product:Object,
   productSub:Array,
   category:String,
   price:Number,
   quantity:Number,
   description:String,
   status:{
      type:Boolean,
      default:true,
  }
});
ProductSchema.plugin(mongoosePaginate)
const  ProductModel = mongoose.model('product', ProductSchema);
module.exports=ProductModel;


 