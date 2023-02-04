const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    PhoneNo:Number,
    ban:{
        type:Boolean,
        default:false,
    },
    wishlist:Array,
    cart:Array,
    address:Array,
});

const UserModel = mongoose.model('users', userSchema);
module.exports=UserModel;