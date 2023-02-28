const express = require("express");
const { getCart, getAddtoCart, getRemoveFromCart, getCheckOut, checkOut, addQuantity, minusQuantity, paymentReturnURL, getApplyCoupon, applyCoupon } = require("../controllers/cartController");
const { getCategoryFurniture, furnitureCategorySearch, getViewAllProducts, allProSearch, sortProducts, filterProducts, getSingleProduct } = require("../controllers/productController");
const { getUserLogin, userLogin, getUserSignup, userSignup, getOtp, verifyOTP, getVerifyOTP, getForgetPassword, forgetPassword, verifyPasswordOtp, updatePassword, getReset, userLogout } = require("../controllers/userAuthController");
const router = express.Router();
const {getUserHome, getWishlist, getUserProfile, getAddtoWishlist, removeFromWishlist,  pay, getAddAddress,addAddress, getRemoveAddress, getUserOrders,getCancelOrder, getReturnProduct, errorPage} = require("../controllers/userController");
const verifyUser = require("../middlewares/userSession");

router.post("/loginSub",userLogin);
router.get("/signup",getUserSignup);
router.post("/signup", userSignup);
router.post("/verify-otp", verifyOTP)
router.get('/verify-otp',getVerifyOTP)
router.get("/", getUserHome);
router.get("/login",getUserLogin);
router.get('/otp',getOtp)
router.get('/forgetPassword',getForgetPassword)
router.post('/forgetPassword',forgetPassword)
router.post('/verifyPasswordOtp',verifyPasswordOtp)
router.post('/updatePassword',updatePassword)
router.get('/reset/:email/:password/:PhoneNo/:name',getReset)
router.get('/category-furniture',getCategoryFurniture)
router.post('/categoryProSearch',furnitureCategorySearch)
router.get('/viewAllProducts',getViewAllProducts)
router.get('/allProSearch',allProSearch)
router.get('/sort',sortProducts)
router.get('/filter',filterProducts)
router.get('/singleProduct/:id',getSingleProduct)
router.get("/error",errorPage)
router.use(verifyUser)
router.get("/logout", userLogout);
router.get('/cart',getCart) 
router.get('/addtoCart/:id',getAddtoCart)
router.get('/addQuantity/:id',addQuantity)
router.get('/minusQuantity/:id',minusQuantity)
router.get('/removeFromCart/:id',getRemoveFromCart)
router.get('/wishlist',getWishlist)
router.get('/addtoWishlist/:id',getAddtoWishlist)
router.get('/removeFromWishlist/:id',removeFromWishlist)
router.get('/userProfile',getUserProfile)
router.get('/addAddress',getAddAddress)
router.post('/addAddress',addAddress)
router.get('/removeAddress/:id',getRemoveAddress)
router.get('/orders',getUserOrders)
router.get('/cancelOrder/:id',getCancelOrder)
router.get('/returnProduct/:id',getReturnProduct)
router.get('/checkOut',getCheckOut)
router.post('/checkOut',checkOut)
router.get('/addCoupon',getApplyCoupon)
router.post('/applyCoupon',applyCoupon)
router.get('/return', paymentReturnURL)
router.post('/pay',pay)

module.exports = router;         

