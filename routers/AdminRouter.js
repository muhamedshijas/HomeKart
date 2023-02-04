const express=require("express")
const AdminModel = require("../models/AdminModel");
const UserModel = require("../models/UserModel");
const banUserModel = require("../models/banUserModel");
const categoryModel=require("../models/CategoryModel")
const ProductModel=require("../models/ProductModel")
const multer=require('multer')
const userRouter=require('../routers/UserRouter');
const upload=require('../middlewares/multer')
const { getAdminHome, getAdminUser, getAdminLogin, adminLogin, getDeleteUser, getAdminBanned, getBanUser,getCoupons,
     getUnbanUser, searchUser, getadminLogout, getProduct, getAddCategory, addCategory, getAddProduct, addProduct, 
     getDeleteProduct, getEditProduct, editProduct, searchProduct, getCategory, deleteCategory, getOrder, getBanner,
      getEditCategory, editCategory, getOrders, searchOrders, getChangeStatus, changeStatus,
       getUnListedProducts, getList, getAddcoupon,couponAdd, getdeleteCoupon, getAddBanner, bannerAdd, getBannerDelete } = require("../controllers/adminController");

const router=express.Router();



router.get('/',getAdminHome)
router.get('/user',getAdminUser)
router.get('/login',getAdminLogin)
router.post('/logSubmit',adminLogin)
router.get('/delete/:id',getDeleteUser)     
router.get('/banuser/:id',getBanUser)
router.get('/banned',getAdminBanned) 
router.get('/unBan/:id',getUnbanUser)
router.post('/search',searchUser)      
router.get('/logout',getadminLogout)
router.get('/product',getProduct)
router.get('/addCategory',getAddCategory)
router.post('/add',addCategory)
router.get('/addProduct',getAddProduct)
router.post('/productAdd',upload.fields([{ name:'image'}, { name:'subImages',maxCount:3}]),addProduct)
router.get('/productDelete/:id',getDeleteProduct)
router.get('/productEdit/:id',getEditProduct)
router.post('/editProduct',upload.single('products'),editProduct)
router.post('/searchProduct',searchProduct)
router.get('/category',getCategory)
router.get('/deleteCategory/:id',deleteCategory)
router.get('/banner',getBanner)
router.get('/editCategory/:id',getEditCategory)
router.post('/editCategory',editCategory)
router.get('/orders',getOrders)
router.post('/searchOrder',searchOrders)
router.get('/changeStatus/:id',getChangeStatus)
router.post('/changeStatus',changeStatus)
router.get('/unListedProducts',getUnListedProducts)
router.get('/list/:id',getList)
router.get('/coupons',getCoupons)
router.get('/addCoupons',getAddcoupon)
router.post('/couponAdd',couponAdd)
router.get('/couponDelete/:id',getdeleteCoupon)
router.get('/addBanner',getAddBanner)
router.post('/bannerAdd',upload.single('banners'),bannerAdd)
router.get('/bannerDelete/:id',getBannerDelete)
module.exports= router;  