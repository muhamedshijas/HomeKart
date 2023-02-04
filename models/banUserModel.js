const mongoose = require("mongoose")

const banUserSchema = new mongoose.Schema({
    email:String,
});

const  banUserModel = mongoose.model('bannedusers', banUserSchema);
module.exports=banUserModel;
                  