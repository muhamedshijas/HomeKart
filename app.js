const express=require('express')
const session = require("express-session");
const {engine} = require("express-handlebars")
const path = require("path")
const UserRouter=require('./routers/UserRouter')
const AdminRouter=require('./routers/AdminRouter')
const dbConnect =require("./dbConnect")
require("dotenv").config()
dbConnect();
const app=express()
app.use(session({ secret: "key", resave: false, saveUninitialized: true }));
app.use(express.urlencoded({extended:true}));
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))
app.use(function(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
next();
});
app.engine("hbs", engine({extname:".hbs"}))
app.set('view engine', 'hbs');
app.use('/admin',AdminRouter)
app.use('/',UserRouter) 

       
app.listen(2255,()=>{
    console.log("started on 2555")
})
      