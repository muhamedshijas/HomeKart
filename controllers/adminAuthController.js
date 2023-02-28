const AdminModel = require("../models/AdminModel");
const UserModel = require("../models/UserModel");
const banUserModel = require("../models/banUserModel");
const categoryModel = require("../models/CategoryModel")
const ProductModel = require("../models/ProductModel")
const OrderModel = require("../models/OrderModel")
const CouponModel = require('../models/CouponModel')
const BannerModel = require('../models/BannerModel')
const multer = require('multer')
const userRouter = require('../routers/UserRouter')
const hbs = require('express-handlebars')
const pdf = require('html-pdf')
const fs = require('fs')
const path = require('path')
const alert = require('alert')


const getAdminLogin = (req, res) => {
   try{
    if (req.session.admin) {
        res.redirect('/admin')
    }
    else {
        res.render('AdminLogin')
    }
   }
   catch{
    res.send("error")
   }
}
const adminLogin = async (req, res) => {
   try{
    if (req.body.email == "" || req.body.password == "") {
        const adminFillErr = "please Fill the requiered fields"
        res.render('AdminLogin', { adminFillErr })
    }
    const adminOg = await UserModel.findOne({ email: req.body.email, admin: true })
    if (adminOg) {
        if (req.body.password == adminOg.password) {
            req.session.admin = {
                name: adminOg.name,
                _id: adminOg._id
            }
            res.redirect('/admin')
        }
        else {
            const err = "Invalid Login Detials"
            res.render('AdminLogin', { err })
        }
    }
    const userOg = await UserModel.findOne({ email: req.body.email, staff: true }).lean()
    if (userOg) {
        if (req.body.password == userOg.password) {
            req.session.staff = {
                name: userOg.name,
                _id: userOg._id
            }
            res.redirect('/admin')
        } else {
            const err = "Invalid Login Detials"
            res.render('AdminLogin', { err })
        }
    }
    else {
        const adminErr = "No data found"
        res.render('AdminLogin', { adminErr })
    }
   }
   catch{
    res.send("error")
   }
}
const getadminLogout = (req, res) => {
   try{
    req.session.admin = null
    res.redirect('/admin/login')
   }
   catch{
    res.send("error")
   }
}
module.exports = {getAdminLogin,adminLogin,getadminLogout}