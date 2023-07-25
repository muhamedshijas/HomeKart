const mongoose = require('mongoose');

const dbConnect=()=>{
    mongoose.set('strictQuery', true);
    mongoose.connect('mongodb+srv://shijas:muhamedShijas@cluster0.n9am9so.mongodb.net/')
    .then(() => console.log('Connected!')).catch(err=>{
        console.log("error : ", err)
    })
}

module.exports=dbConnect   