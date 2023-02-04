const express = require("express");

const router = express.Router();
const { getUserHome, getUserLogin, getOtp, userLogin, userSignup, getUserSignup,
     verifyOTP, userLogout,  getVerifyOTP,getCategoryFurniture, furnitureCategorySearch, getCategoryHomeAppliances,
      homeCategorySearch, getViewAllProducts, allProSearch, sortProducts, filterProducts, pagination,
       getForgetPassword, forgetPassword, verifyPasswordOtp, updatePassword, getSingleProduct, getResendOtp, getReset, getCart, getWishlist, getUserProfile, getAddtoWishlist, removeFromWishlist, getAddtoCart, getCheckOut, getRemoveFromCart, checkCoupon, pay, getAddAddress, addAddress, getRemoveAddress, getUserOrders} = require("../controllers/userController");
const verifyUser = require("../middlewares/userSession");
var randomOtp;


router.post("/loginSub",userLogin);
router.get("/signup",getUserSignup);
router.post("/signup", userSignup);
router.post("/verify-otp", verifyOTP)
router.get('/verify-otp',getVerifyOTP)
router.get("/", getUserHome);
router.get("/login", getUserLogin);
router.get('/otp',getOtp)
router.get('/forgetPassword',getForgetPassword)
router.post('/forgetPassword',forgetPassword)
router.post('/verifyPasswordOtp',verifyPasswordOtp)
router.post('/updatePassword',updatePassword)
router.get('/reset/:email/:password/:PhoneNo/:name',getReset)
router.use(verifyUser)

router.get("/logout", userLogout);
router.get('/category-furniture',getCategoryFurniture)
router.post('/categoryProSearch',furnitureCategorySearch)
router.get('/viewAllProducts',getViewAllProducts)
router.get('/allProSearch',allProSearch)
router.get('/sort',sortProducts)
router.get('/filter',filterProducts)
router.get('/singleProduct/:id',getSingleProduct)

router.get('/cart',getCart)
router.get('/wishlist',getWishlist)
router.get('/userProfile',getUserProfile)
router.get('/addtoWishlist/:id',getAddtoWishlist)
router.get('/removeFromWishlist/:id',removeFromWishlist)
router.get('/addtoCart/:id',getAddtoCart)
router.get('/checkOut',getCheckOut)
router.get('/removeFromCart/:id',getRemoveFromCart)
router.post('/checkCoupon',checkCoupon)
router.post('/pay',pay)
router.get('/addAddress',getAddAddress)
router.post('/addAddress',addAddress)
router.get('/removeAddress/:id',getRemoveAddress)
router.get('/orders',getUserOrders)
module.exports = router;         

