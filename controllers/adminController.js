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
const cloudinary=require('cloudinary').v2;

cloudinary.config({
    cloud_name:'dv5bvojzi',
    api_key:'946871821531742',
    api_secret:'wItlSu6khy3FBHyqAEtWL8MES3c'
  });

const getAdminHome = async (req, res) => {
  try{
    if (req.session.admin || req.session.staff) {
        const orders = await OrderModel.find().lean()
        const deliveredOrder = await OrderModel.find({ status: "Delivered" }).lean()
        let totalRevenue = 0;
        let totalDiscount = 0;
        let Orders = deliveredOrder.filter(item => {
            totalRevenue = totalRevenue + item.totalPrice;
            totalDiscount = totalDiscount + item.discount
        })
        const monthlyDataArray = await OrderModel.aggregate([{ $match: { status: "Delivered" } }, { $group: { _id: { $month: "$dateOrdered" }, sum: { $sum: "$totalPrice" } } }])
        const monthlyReturnArray = await OrderModel.aggregate([{ $match: { status: "Returned" } }, { $group: { _id: { $month: '$dateOrdered' }, sum: { $sum: '$totalPrice' } } }])
        let monthlyDataObject = {}
        let monthlyReturnObject = {}
        monthlyDataArray.map(item => {
            monthlyDataObject[item._id] = item.sum
        })
        monthlyReturnArray.map(item => {
            monthlyReturnObject[item._id] = item.sum
        })
        let monthlyReturn = []
        for (let i = 1; i <= 12; i++) {
            monthlyReturn[i - 1] = monthlyReturnObject[i] ?? 0
        }
        let monthlyData = []
        for (let i = 1; i <= 12; i++) {
            monthlyData[i - 1] = monthlyDataObject[i] ?? 0
        }
        const online=await OrderModel.find({paymentType:"online"}).lean().countDocuments()
        const cod=await OrderModel.find({paymentType:"COD"}).lean().countDocuments()
        console.log(online)
        console.log(cod)
        const userCount = await UserModel.find({ $and: [{ staff: false }, { admin: false }] }).lean().countDocuments()
        const productCount = await ProductModel.find().lean().countDocuments()
        const orderCount = await OrderModel.find().lean().countDocuments()
        const avgRevenue = parseInt(totalRevenue / orderCount)
        const userData = await UserModel.find({ $and: [{ staff: false }, { admin: false }] }).sort({ _id: -1 }).limit(5).lean()
        const orderData = await OrderModel.find().sort({ _id: -1 }).limit(5).lean()
        const products = await ProductModel.find().sort({ _id: -1 }).limit(5).lean()
        res.render('AdminHome', { totalRevenue, userCount, productCount, orderCount, userData, orderData, products, totalDiscount, monthlyData, monthlyReturn,online,cod})
    }
    else {
        res.redirect('/admin/login')
    }
  }
  catch{
    res.redirect('/admin/error')
}
}

const salesReport = async (req, res) => {
    try{
        if (req.session.admin || req.session.staff) {
            const start = req.body.start
            const end = req.body.end
            const orders = await OrderModel.find({ $and: [{ dateOrdered: { $gt: start } }, { dateOrdered: { $lt: end } }] }).lean()
            const orderCounts = await OrderModel.find({ $and: [{ dateOrdered: { $gt: start } }, { dateOrdered: { $lt: end } }] }).lean().countDocuments()
            let totalAmount = 0
            const pro = orders.map((item, index) => {
                totalAmount = totalAmount + item.totalPrice
                return totalAmount
            })
            const order = await OrderModel.find().lean()
            let totalRevenue = 0;
            let totalDiscount = 0;
            let Orders = orders.filter(item => {
                totalRevenue = totalRevenue + item.totalPrice;
                totalDiscount = totalDiscount + item.discount
            })
            const averageRevenue = parseInt(totalAmount / orderCounts)
            const userCount = await UserModel.find({ $and: [{ staff: false }, { admin: false }] }).lean().countDocuments()
            const productCount = await ProductModel.find().lean().countDocuments()
            const orderCount = await OrderModel.find().lean().countDocuments()
            const userData = await UserModel.find({ $and: [{ staff: false }, { admin: false }] }).sort({ _id: -1 }).limit(5).lean()
            const orderData = await OrderModel.find().sort({ _id: -1 }).limit(5).lean()
            const products = await ProductModel.find().sort({ _id: -1 }).limit(5).lean()
            res.render('AdminSalesReport', {
                totalAmount, orderCount, averageRevenue, totalRevenue, userCount, productCount,
                orderCounts, userData, orderData, products, orders, totalDiscount
            })
        }
    }catch{
        res.redirect('/admin/error')
    }
}

const getAdminUser = async (req, res) => {
 try{
    if (req.session.admin) {
        const userData = await UserModel.find({}).lean()
        res.render("AdminUser", { userData })
    }
    else {
        alert("You have no access to this page")
        res.redirect('/admin')
    }
 }
 catch{
    res.redirect('/admin/error')
 }
}

const getDeleteUser = (req, res) => {
    try{
        const _id = req.params.id;
    UserModel.deleteOne({ _id })
        .then(() => {
            userDeleted = true;

            if (_id == req.session.user.id) {
                req.session.user = null
            }
            res.redirect('/admin/user')
        })
        .catch((err) => {
            console.log("error is" + err)
        })
    }
    catch{
        res.redirect('/admin/error')
    }
}

const getBanUser = async (req, res) => {
    try{
        const _id = req.params.id
    await UserModel.findByIdAndUpdate({ _id }, { $set: { staff: true } })
    res.redirect('/admin/user')
    }
    catch{
        res.redirect('/admin/error')
    }

}

const getUnbanUser = async (req, res) => {
    try{
        const _id = req.params.id
    await UserModel.findByIdAndUpdate({ _id }, { $set: { staff: false } })
    res.redirect('/admin/user')
    }catch{
        res.redirect("/admin/error")
    }
}

const searchUser = async (req, res) => {
    try{
        const name = req.body.name
    const userData = await UserModel.find({ name: new RegExp(name) }).lean()
    res.render('AdminUser', { userData })
    }catch{
        res.redirect('/admin/error')
    }
}

const getAddCategory = (req, res) => {
    try{
        res.render('AddCategory')
    }
    catch{
        res.redirect('/admin/error')
    }
}

const addCategory = async (req, res) => {

    const category = req.body.category.toLowerCase()
    console.log(category)
    const newCategory = await categoryModel.findOne({ category: category })
    if (newCategory) {
        const errMsg = "Category Already found"
        res.render('AddCategory', { errMsg })
    }
    else {
        const categories = new categoryModel({ category })
        categories.save();
        res.redirect('/admin/category')
    }


  
  }


const getCategory = async (req, res) => {
  try{
    const categories = await categoryModel.find().lean()
    res.render('AdminCategory', { categories })
  }
  catch{
    res.redirect('/admin/error')
  }
}

const deleteCategory = (req, res) => {
  try{
    const _id = req.params.id;
    categoryModel.deleteOne({ _id })
        .then(() => {
            categoryDeleted = true;
            res.redirect('/admin/category')
        })
        .catch((err) => {
            console.log("error is" + err)
        })
  }
  catch{
    res.redirect('/admin/error')
  }
}

const getOrder = (req, res) => {
   try{
    res.render('AdminOrder')
   }
   catch{
    res.redirect('/admin/error')
   }
}

const getEditCategory = async (req, res) => {
   try{
    const _id = req.params.id
    const category = await categoryModel.findOne({ _id }).lean()
    res.render('editCategory', { category })
   }
   catch{
    res.redirect('/admin/error')
   }
}

const editCategory = async (req, res) => {
  try{
    const _id = req.body._id
    const category = req.body.category
    await categoryModel.findByIdAndUpdate(_id, { $set: { category: req.body.category } })
    await ProductModel.findOneAndUpdate(category, { $set: { category: req.body.category } })
    res.redirect('/admin/category')
  }
  catch{
    res.redirect('/admin/error')
  }
}

const getOrders = async (req, res) => {
    try{
        const ordersArr = await OrderModel.find().lean()
    let orders = ordersArr.map(item => {
        return { ...item, dateDelivered: item.dateDelivered.toLocaleDateString(), dateOrdered: item.dateOrdered.toLocaleDateString(), userId: item.userId }
    })
    const { orderItems } = await OrderModel.find({ orderItems: 1 })
    let returnCount = await OrderModel.find({ status: "Returned" }).lean().countDocuments()
    let totalcount = await OrderModel.find().lean().countDocuments()
    let pendingCount = await OrderModel.find({ status: "pending" }).lean().countDocuments()
    let deliveredCount = await OrderModel.find({ status: "Delivered" }).lean().countDocuments()
    let cancelCount = await OrderModel.find({ status: "Cancelled" }).lean().countDocuments()
    res.render('AdminOrder', { orders, totalcount, pendingCount, deliveredCount, cancelCount, returnCount })
    }catch{
        res.redirect('/admin/error')
    }
}

const searchOrders = async (req, res) => {
    try{
        const name = req.body.name
        const ordersArr = await OrderModel.find({ user: new RegExp(name, 'i') }).lean()
        let orders = ordersArr.map(item => {
            return { ...item, dateDelivered: item.dateDelivered.toLocaleDateString(), dateOrdered: item.dateOrdered.toLocaleDateString(), userId: item.userId }
        })   
    let totalcount = await OrderModel.find().lean().countDocuments()
    let pendingCount = await OrderModel.find({ status: "pending" }).lean().countDocuments()
    let deliveredCount = await OrderModel.find({ status: "Delivered" }).lean().countDocuments()
    let cancelCount = await OrderModel.find({ status: "Cancelled" }).lean().countDocuments()
    res.render('AdminOrder', { orders, totalcount, pendingCount, deliveredCount, cancelCount })
    }catch{
        res.redirect('/admin/error')
    }
}

const getChangeStatus = async (req, res) => {
    try{
        const _id = req.params.id;
    const order = await OrderModel.findOne({ _id }).lean()
    res.render('changeStatus', { order })
    }
    catch{
        res.redirect('/admin/error')
    }
}

const changeStatus = async (req, res) => {
   try{
    const _id = req.body._id
    const orders = await OrderModel.findOne({ _id }).lean()
    const newStatus = req.body.status
    console.log(newStatus)
    if (newStatus == "Delivered") {
        await OrderModel.findByIdAndUpdate(_id, { $set: { status: newStatus, return: true ,delivered:true} })
    }
    else if (newStatus == "CannotReturn") {
        await OrderModel.findByIdAndUpdate(_id, { $set: { status: "Pending", return: false, cancel: false, returnStatus: false} })
    }
    else if (newStatus == "ReturnProduct") {
        await OrderModel.findByIdAndUpdate(_id, { $set: { status: "Returned" ,returnStatus:'false',cancel:true } })
        const totalPrice = orders.totalPrice
        await UserModel.findOneAndUpdate({ _id: orders.userId }, { $inc: { wallet: +totalPrice } })

    }
    else {
    await OrderModel.findByIdAndUpdate(_id, { $set: { status: newStatus,  return: false, cancel: false } })
    }
    res.redirect('/admin/orders')
   }catch{
    res.redirect('/admin/error')
   }
}

const getUnListedProducts = async (req, res) => {
    try{
        const unListedproducts = await ProductModel.find({ status: false }).lean()
    res.render('UnListedProducts', { unListedproducts })
    }catch{
        res.redirect('/admin/error')
    }
}

const getCoupons = async (req, res) => {
 try{
    const couponsArr = await CouponModel.find().lean()
    let coupons = couponsArr.map(item => {
        return { ...item, expiryDate: item.expiryDate.toLocaleString() }
    })
    res.render('AdminCoupon', { coupons })
 }catch{
    res.redirect('/admin/error')
 }
}

const getAddcoupon = (req, res) => {
    try{
        res.render('AddCoupons')
    }catch{
        res.redirect('/admin/error')
    }
}

const couponAdd = async (req, res) => {
    try{

        const name = req.body.name
        const code = req.body.code
        const expiryDate = new Date(req.body.expiry)
    const discount = req.body.Discount
    const coupons = new CouponModel({ name, code, expiryDate, discount })
    await coupons.save()
    res.redirect('/admin/coupons')
    }
    catch{
        res.redirect('/admin/error')
    }
}

const getdeleteCoupon = async (req, res) => {
    try{
    const _id = req.params.id
    await CouponModel.findByIdAndDelete({ _id })
    res.redirect('/admin/coupons')
    }
    catch{
        res.redirect('/admin/error')
    }
}

const getBanner = async (req, res) => {
    try{

        const banners = await BannerModel.find().lean()
        res.render('AdminBanner', { banners })
    }catch{ res.redirect('/admin/error')}
    }

const getAddBanner = (req, res) => {
    try{

        res.render('AddBanner')
    }catch{
        res.redirect('/admin/error')
    }
}

const bannerAdd = (req, res) => {
    try{

        const name = req.body.name
        const banner = req.file.filename
        const banners = new BannerModel({ name, banner })
        banners.save()
        res.redirect('/admin/banner')
    }catch{
        res.redirect('/admin/error')
    }
    }

const getBannerDelete = async (req, res) => {
    try{

        const _id = req.params.id
        await BannerModel.findByIdAndDelete({ _id })
        res.redirect('/admin/banner')
    }catch{
        res.redirect('/admin/error')
    }
}

const getSalesReport = async (req, res) => {
    try{
        
        const orders = await OrderModel.find().lean()
        res.render('AdminSalesReport')
    }catch{
        res.redirect('/admin/error')
    }
    }

const filterOrder = async (req, res) => {
    try{

        let filter = req.query.filter ?? ""
        if (filter == "All") {
            filter = ""
        }
        const ordersArr = await OrderModel.find({ status: new RegExp(filter, 'i') }).lean()
        let orders = ordersArr.map(item => {
            return {
            ...item, dateDelivered: item.dateDelivered.toLocaleDateString(),
            dateOrdered: item.dateOrdered.toLocaleDateString(), userId: item.userId
        }
    })
    const { orderItems } = await OrderModel.find({ orderItems: 1 })
    let returnCount = await OrderModel.find({ status: "Returned" }).lean().countDocuments()
    let totalcount = await OrderModel.find().lean().countDocuments()
    let pendingCount = await OrderModel.find({ status: "pending" }).lean().countDocuments()
    let deliveredCount = await OrderModel.find({ status: "Delivered" }).lean().countDocuments()
    let cancelCount = await OrderModel.find({ status: "Cancelled" }).lean().countDocuments()
    res.render('AdminOrder', { orders, totalcount, pendingCount, deliveredCount, cancelCount, returnCount })
}catch{
    res.redirect('/admin/error')
}
}

const getProduct = async (req, res) => {
    try{

        if (req.session.admin || req.session.staff) {
            const products = await ProductModel.find({ status: true }).lean()
            res.render('AdminProducts', { products })
    }
    else {
        res.redirect('/admin/login')
    }
}catch{
    res.redirect('/admin/error')
}
}

const getAddProduct = async (req, res) => {
    try{

        const category = await categoryModel.find().lean()
        res.render("AddProduct", { category })
    }catch{
        res.redirect('/admin/error')
    }
}

const addProduct = async(req, res) => {
    let mainImage=req.files.product[0]
    let subImages=req.files.subImages
    let imageFile=await cloudinary.uploader.upload(mainImage.path,{folder:'HomeKart'})
    let product=imageFile

    for(let i in subImages){
        let imageFile=await cloudinary.uploader.upload(subImages[i].path,{folder:'HomeKart'})
        subImages[i]=imageFile
    }

    ProductModel.create({
        name: req.body.name,
        product:product, 
        productSub:subImages,
        category: req.body.category,
        price: req.body.price, 
        quantity: req.body.quantity,
        description: req.body.description

    }).then((products) => {
        res.redirect('/admin/product')
    }).catch((Error) => {
        console.log(Error)
        res.redirect('/admin/product')
    })
}

const getDeleteProduct = async (req, res) => {
    const _id = req.params.id;
    try{

        await ProductModel.findByIdAndUpdate({ _id }, { $set: { status: false } })
        res.redirect('/admin/product')
    }catch{
        res.redirect('/admin/error')
    }

}
const getEditProduct = async (req, res) => {
    try{

        const _id = req.params.id
        const productDetials = await ProductModel.findOne({ _id }).lean()
        const category = await categoryModel.find().lean()
        res.render('EditProduct', { productDetials, category })
    }catch{
        res.redirect('/admin/error')
    }
}
const editProduct = async (req, res) => {
    try{
        {
            const _id = req.body._id
            let subImages=req.files.subImages
            let product
            if(req.files?.product)
            {
            let mainImage=req.files.product[0]
            let imageFile=await cloudinary.uploader.upload(mainImage.path,{folder:'HomeKart'})
            product=imageFile
            }
            if(req.files?.subImages){
                for(let i in subImages){
                    let imageFile=await cloudinary.uploader.upload(subImages[i].path,{folder:'HomeKart'})
                    subImages[i]=imageFile
                }
            }
            if (req.files.product && req.files.subImages) {
                await ProductModel.findByIdAndUpdate(_id, {
                    $set: {
                        name: req.body.name,
                        product: product,
                        productSub:subImages,
                        price: req.body.price,
                        quantity: req.body.quantity,
                        description: req.body.description
                    }
                })
                return res.redirect('/admin/product')
        
            }
            if (req.files.product && !req.files.subImages) {
                await ProductModel.findByIdAndUpdate(_id, {
                    $set: {
                        name: req.body.name,
                        category: req.body.category,
                        price: req.body.price,
                        quantity: req.body.quantity,
                        description: req.body.description,
                        product:product,
                    }
                })
                return res.redirect('/admin/product')
            }
            if (!req.files.product && req.files.subImages) {
                await ProductModel.findByIdAndUpdate(_id, {
                    $set: {
                        name: req.body.name,
                        category: req.body.category,
                        price: req.body.price,
                        quantity: req.body.quantity,
                        description: req.body.description,
                        productSub:subImages, 
                    }
                })
                return res.redirect('/admin/product')
            }
        
            await ProductModel.findByIdAndUpdate(_id, {
                $set: {
                    name: req.body.name,
                    category: req.body.category,
                    price: req.body.price,
                    quantity: req.body.quantity,
                    description: req.body.description
                }
            })
            return res.redirect('/admin/product')
        }
    }catch{
        res.redirect('/admin/error')
    }
}
const searchProduct = async (req, res) => {
    try{

        const name = req.body.name
    const products = await ProductModel.find({ name: new RegExp(name, 'i') }).lean()
    res.render('AdminProducts', { products })
    }catch{
        res.redirect('/admin/error')
    }
}
const getList = async (req, res) => {
    try{

        const _id = req.params.id
        await ProductModel.findByIdAndUpdate({ _id }, { $set: { status: true } })
        res.redirect('/admin/product')
    }catch{
        res.redirect('/admin/error')
    }
}
const getAdminSingleOrder=async(req,res)=>{
    try{
        const _id=req.params.id
    const orders=await OrderModel.findOne({_id}).lean()
    const dateDelivered=orders.dateDelivered.toLocaleDateString()
const dateOrdered=orders.dateOrdered.toLocaleDateString()
    res.render('AdminSingleOrder',{orders,dateDelivered,dateOrdered})
    }catch{
        res.redirect('/admin/error')
    }

}
const adminErrorPage=(req,res)=>{
    res.render("adminErrorPage")
  }

module.exports = {getAddCategory,adminErrorPage,getList,getAddProduct,addProduct,getEditProduct,editProduct,getDeleteProduct,searchProduct, getProduct,getAdminHome,  getAdminUser, getBanUser, addCategory, getDeleteUser,getUnbanUser, deleteCategory,searchUser, getCategory, getOrder, getBanner, getEditCategory, editCategory, getOrders, searchOrders,getChangeStatus, changeStatus, getUnListedProducts, getCoupons, getAddcoupon, couponAdd, getdeleteCoupon, getAddBanner,bannerAdd, getBannerDelete, salesReport, getSalesReport, filterOrder,getAdminSingleOrder}