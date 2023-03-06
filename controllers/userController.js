const session = require("express-session");
const Cashfree = require('cashfree-sdk')
const nodemailer = require('nodemailer');
const UserModel = require("../models/UserModel");
const categoryModel = require("../models/CategoryModel")
const banUserModel = require("../models/banUserModel");
const BannerModel = require("../models/BannerModel")
const ProductModel = require("../models/ProductModel");
const CouponModel = require("../models/CouponModel");
const OrderMoel = require("../models/OrderModel");
const OrderModel = require("../models/OrderModel");
const axios = require("axios")

let randomOtp;

const getUserHome = async (req, res) => {
 try{
  const banners = await BannerModel.find().lean()
  const products = await ProductModel.find({ status: true }).limit(10).lean()
  res.render("UserHome", { products, banners });
 }catch{
  res.redirect('/error')
 }
}

const getUserProfile = async (req, res) => {
try{
  if (req.session.user) {
    const _id = req.session.user.id
    const user = await UserModel.findById({ _id }).lean()
    const { address } = await UserModel.findOne({ _id }, { address: 1 })
    res.render('userProfile', { user, address })
  } else {
    res.redirect('/login')
  }
}catch{
  res.redirect('/error')
}
}
const getAddtoWishlist = async (req, res) => {
 try{
  if (req.session.user) {
    const _id = req.session.user.id
    const proId = req.params.id
    await UserModel.findByIdAndUpdate({ _id }, { $addToSet: { wishlist: proId } })
    res.redirect('/wishlist')
  } else {
    res.redirect('/login')
  }
 }catch{
  res.redirect('/error')
 }
}

const getWishlist = async (req, res) => {
try{
  if (req.session.user) {
    const _id = req.session.user.id
    const { wishlist } = await UserModel.findOne({ _id }, { wishlist: 1 })
    if (wishlist == "") {
      noItem = "No items Found"
      res.render('wishlist', { noItem })
    }
    else{

      const products = await ProductModel.find({ _id: { $in: wishlist }, status: true }).lean()
      res.render('wishlist', { products})
    }
  }
  else {
    res.redirect('/login')
  }
}catch{
  res.redirect('/error')
}
}
const removeFromWishlist = async (req, res) => {
  try{
    if (req.session.user) {
      const _id = req.session.user.id
      const proId = req.params.id
      await UserModel.updateOne({ _id }, { $pull: { wishlist: proId } })
      res.redirect('back')
    }
    else {
      res.redirect('/login')
    }
  }catch{
    res.redirect('/error')
  }
}

const pay = (req, res) => {
 try{
  res.render('succesfull')
 }catch{
   res.redirect('/error')
}
  
}

const getAddAddress = (req, res) => {
 try{
  const _id = Date.now()
  if (req.session.user) {
    res.render('AddAddress', { _id })
  }
  else {
    res.redirect('/login',)
  }
 }catch{
  res.redirect('/error')
 }
}

const addAddress = async (req, res) => {
 try{
  const _id = req.session.user.id
  await UserModel.findByIdAndUpdate({ _id }, { $addToSet: { address: req.body } })
  res.redirect('/checkout')
 }catch{
  res.redirect('/error')
 }
}

const getRemoveAddress = async (req, res) => {
 try{
  const _id = req.session.user.id
  const addId = req.params.id
  await UserModel.updateOne({ _id, address: { $elemMatch: { id: addId } } }, {
    $pull: {
      address:
      {
        id: addId
      }

    }
  })
  res.redirect('back')
 }catch{
  res.redirect('/error')
 }
}

const getUserOrders = async (req, res) => {
try{
  const userId = req.session.user.id
  const ordersArr = await OrderModel.find({ userId }).lean()
  let orders = ordersArr.map(item => {
    return { ...item, dateDelivered: item.dateDelivered.toLocaleDateString() }
  })
  res.render('UserOrder', { orders })
}catch{
  res.redirect('/error')
}
}
const getCancelOrder = async (req, res) => {
  try{
    const _id = req.params.id
  const orders = await OrderModel.findOne({ _id }).lean()
  await OrderModel.findOneAndUpdate({ _id }, { $set: { status: "Cancelled", cancel: true } }).lean()
  const proId = orders.orderItems._id
  const quantity = orders.quantity
  await ProductModel.findByIdAndUpdate({ _id: proId }, { $inc: { quantity: +quantity } })
  res.redirect('/orders')
  }catch{
    res.redict('/error')
  }
}
const getReturnProduct = async (req, res) => {
 try{
  const _id = req.session.user.id
  const oId = req.params.id
  const orders = await OrderModel.findOne({ _id: oId }).lean()
  const totalPrice = orders.totalPrice
  await OrderModel.findByIdAndUpdate({ _id: oId }, { $set: { status: "Return Processing", returnStatus: true,return:false} })
  const user = await UserModel.find({ _id }).lean()
  const proId = orders.orderItems._id
  const quantity = orders.quantity
  await ProductModel.findByIdAndUpdate({ _id: proId }, { $inc: { quantity: +quantity } })
  res.redirect("back")
 }catch{
  res.redirect('/error')
 }
}
const errorPage=(req,res)=>{
  try{
    res.render("errorPage")
  }catch{
    res.redirect('/error')
  }
}
const getViewOrder=async(req,res)=>{
try{
  const _id=req.params.id
  const orders=await OrderModel.findOne({_id}).lean()
  console.log(orders)
  const dateDelivered=orders.dateDelivered.toLocaleDateString()
  const dateOrdered=orders.dateOrdered.toLocaleDateString()
    res.render('viewUserOrder',{orders,dateDelivered,dateOrdered})
}
catch{
  res.redirect('/error')
}
}
module.exports = {getUserHome,getWishlist,errorPage,getUserProfile, getAddtoWishlist, removeFromWishlist, pay, getAddAddress, addAddress, getRemoveAddress,getUserOrders,getCancelOrder, getReturnProduct,getViewOrder}