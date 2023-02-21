const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    PhoneNo:Number,
    staff:{
        type:Boolean,
        default:false,
    },

    wishlist:Array,
    cart:Array,
    address:Array,
    
    wallet:{
        type:Number,
        default:0
    },
    admin:{
        type:Boolean,
        default:false
    }
});

const UserModel = mongoose.model('users', userSchema);
module.exports=UserModel;