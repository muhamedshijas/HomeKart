const mongoose = require('mongoose');

const dbConnect=()=>{
    mongoose.set('strictQuery', true);
    mongoose.connect('mongodb+srv://muhamedshijas:Wildhunter2.0@cluster0.nfsaofu.mongodb.net/?retryWrites=true&w=majority')
    .then(() => console.log('Connected!')).catch(err=>{
        console.log("error : ", err)
    })
}

module.exports=dbConnect   