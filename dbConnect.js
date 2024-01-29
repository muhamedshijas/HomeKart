const mongoose = require('mongoose');

const dbConnect=()=>{
    mongoose.set('strictQuery', true);
    mongoose.connect('mongodb+srv://shijas:EwWOxCrg2DXxP0lU@cluster0.n9am9so.mongodb.net/')
    .then(() => console.log('Connected!')).catch(err=>{
        console.log("error : ", err)
    })
}

module.exports=dbConnect   