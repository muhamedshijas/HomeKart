const mongoose = require("mongoose")

const bannerSchema = new mongoose.Schema({
   name:String,
   banner:String,

});

const  BannerModel = mongoose.model('banners', bannerSchema);
module.exports=BannerModel;


