const mongoose = require("mongoose")

const couponSchema = new mongoose.Schema({
    name:String,
    code:String,
    expiryDate:Date,
    discount:Number,
   
});

const CouponModel = mongoose.model('coupons', couponSchema);
module.exports=CouponModel;