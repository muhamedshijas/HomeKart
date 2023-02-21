const express=require("express")
const AdminModel = require("../models/AdminModel");
const UserModel = require("../models/UserModel");
const banUserModel = require("../models/banUserModel");
const categoryModel=require("../models/CategoryModel")
const ProductModel=require("../models/ProductModel")
const multer=require('multer')
const userRouter=require('../routers/UserRouter');
const upload=require('../middlewares/multer')
const { getAdminHome, getAdminUser, getDeleteUser, getAdminBanned, getBanUser,getCoupons,getUnbanUser, searchUser, getAddCategory, addCategory, getCategory, deleteCategory, getOrder, getBanner,getEditCategory, editCategory, getOrders, searchOrders, getChangeStatus, changeStatus, getUnListedProducts, getAddcoupon,couponAdd, getdeleteCoupon, getAddBanner, bannerAdd, getBannerDelete, salesReport, getExportData, getSalesReport, filterOrder, getProduct, getAddProduct, addProduct, editProduct, searchProduct, getDeleteProduct, getEditProduct, getList } = require("../controllers/adminController");
const { getAdminLogin, adminLogin, getadminLogout } = require("../controllers/adminAuthController");




const router=express.Router();

router.get('/',getAdminHome)
router.get('/user',getAdminUser)
router.get('/login',getAdminLogin)
router.post('/logSubmit',adminLogin)
router.get('/logout',getadminLogout)
router.get('/delete/:id',getDeleteUser)     
router.get('/banuser/:id',getBanUser)
router.get('/unBan/:id',getUnbanUser)
router.post('/search',searchUser)       
router.get('/category',getCategory)
router.get('/addCategory',getAddCategory)
router.post('/add',addCategory)
router.get('/deleteCategory/:id',deleteCategory)
router.get('/editCategory/:id',getEditCategory)
router.post('/editCategory',editCategory)
router.get('/product',getProduct)
router.get('/addProduct',getAddProduct)
router.post('/productAdd',upload.fields([{ name:'product',maxCount:1}, { name:'subImages',maxCount:12}]),addProduct)
router.get('/productDelete/:id',getDeleteProduct)
router.get('/productEdit/:id',getEditProduct)
router.post('/editProduct',upload.fields([{ name:'product',maxCount:1}, { name:'subImages',maxCount:12}]),editProduct)
router.post('/searchProduct',searchProduct)
router.get('/unListedProducts',getUnListedProducts)
router.get('/list/:id',getList)
router.get('/orders',getOrders)
router.post('/searchOrder',searchOrders)
router.get('/changeStatus/:id',getChangeStatus)
router.post('/changeStatus',changeStatus)
router.get('/filterOrder',filterOrder)
router.get('/coupons',getCoupons)
router.get('/addCoupons',getAddcoupon)
router.post('/couponAdd',couponAdd)
router.get('/couponDelete/:id',getdeleteCoupon)
router.get('/banner',getBanner)
router.get('/addBanner',getAddBanner)
router.post('/bannerAdd',upload.single('banners'),bannerAdd)
router.get('/bannerDelete/:id',getBannerDelete)
router.post('/salesRepot',salesReport)
router.get('/salesReport',getSalesReport)
module.exports= router;  