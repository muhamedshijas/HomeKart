const session = require("express-session");
const UserModel = require("../models/UserModel");
const categoryModel=require("../models/CategoryModel")
const banUserModel = require("../models/banUserModel");
const BannerModel=require("../models/BannerModel")
const nodemailer = require('nodemailer');
const ProductModel = require("../models/ProductModel");
const CouponModel = require("../models/CouponModel");


var randomOtp;

const getUserHome=async (req, res) => {
  
      const banners=await BannerModel.find().lean()
        const products=await ProductModel.find({status:true}).limit(10).lean()
    res.render("UserHome",{products,banners});

}

const getUserLogin=(req, res) => {
    if (!req.session.user) {
        res.render("UserLogin");
    } else {
        res.redirect("/");
    }
}

const getOtp=(req,res)=>{
    res.render('otpVerification')
}

const getUserSignup=async(req, res) => {
  res.render("UserSignup");
}

const userLogin=async (req, res) => {
  const email=req.body.email
  const blockuser=await UserModel.findOne({$and:[{email:email},{ban:true}]});
  if(blockuser){
    return res.render("UserLogin", { banErr:"You were banned!!!" })
  }
  
  if (req.body.email == "" || req.body.password == "") {
    const fillErr = "Please fill the requiered fields";
    res.render("UserLogin", { fillErr });
  } else {
    const { email, password } = req.body;
    const userOg = await UserModel.findOne({ email });
    if (userOg) {
      if (userOg.email == email && userOg.password == password) {
        
        req.session.user = {name:userOg.name, id:userOg._id,emailOg:userOg.email};
        
        res.redirect("/");
      } else {
        const loginErr = "invalid Username and Password";
        res.render("UserLogin", { loginErr });
      }
    }else{
        const noUser="no user found"
        res.render('UserSignup',{ noUser })
    }
  }
}


const userSignup=async(req, res) => {
  const email=req.body.email
  const blockuser=await UserModel.findOne({$and:[{email:email},{ban:true}]});
  if(blockuser){

    return res.render("UserSignup", { banErr:"You were banned!!!" })
  }
  const user= await UserModel.findOne({email:req.body.email});
  if(user){
    return res.render("UserSignup", { duplicate:"User already found  please Login" })
  }
  

  if (
    req.body.name == "" ||
    req.body.email == "" ||
    req.body.password == "" ||
    req.body.phoneNo == ""
  ) {
    const fieldRequiered = "All Fields are required to complete Your signup";
    res.render("UserSignup", { fieldRequiered });
  }
  else {
    if (req.body.password != req.body.passwordconfirm) {
      const passworderr = "password must be same";
      res.render("UserSignup", { passworderr });
    } 
    else {
      randomOtp=Math.floor(Math.random()*1000000)
      req.session.otp=randomOtp;
      console.log(randomOtp)

    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // SMTP server address (usually mail.your-domain.com)
      port: 465, // Port for SMTP (usually 465)
      secure: true, // Usually true if connecting to port 465
      auth: {
        user: "muhamedshijasm@gmail.com", // Your email address
        pass: "vgrarunraaribljd", // Password (for gmail, your app password)
      },
    });

      var mailOptions={
        from: 'muhamedshijasm@gmail.com',
        to: req.body.email,
        subject: "Homekart Email verification",
        html: `
        <h1>Verify Your Email For HomeKart</h1>
          <h3>use this code to verify your email</h3>
          <h2>${randomOtp}</h2>
        `,
      }
  
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("email sent error ", error)
        } else {
          console.log("email sent successfull")
        }
      });
      res.render("otpVerification", {...req.body})
      
    }
  }
}

const verifyOTP= (req, res)=>{
  const{name, email, password, PhoneNo}=req.body
  if(req.body.otp==req.session.otp){
    const user = new UserModel({name, email, PhoneNo, password});
      user.save((err, data) => {
        if (err){
          res.render("otpVerification", {error:true, message:"Somethign went wrong", ...req.body})
        }
        else {
          res.redirect("/login");
        }
      });
  }
  else{
    res.render("otpVerification", {error:true, message:"Invalid OTP", ...req.body})

  }
}

const userLogout=(req, res) => {
  req.session.user = null;
  res.redirect("/login");
}

const getVerifyOTP=(req,res)=>{

  res.render('otpVerification')
}

const getCategoryFurniture=async(req,res)=>{
const name=req.query.category
console.log(name)
const products=await ProductModel.find({$and:[{category:name},{status:true}]}).lean()
res.render('categoryFurniture',{products})
}

const furnitureCategorySearch=async(req,res)=>{
const name=req.body.product
const proCategory="furnitures"
console.log(name)
const products=await ProductModel.find({$and:[{name:new RegExp(name)},{category:proCategory},{status:true}]}).lean()
console.log(products)
    res.render('categoryFurniture',{products})
}





    const getViewAllProducts=async(req,res)=>{

      const pageNum=req.query.page   
      const perPage=8
  

     const categories=await categoryModel.find().lean()
      const products=await ProductModel.find({status:true}).skip((pageNum-1)*perPage).limit(perPage).lean()
    res.render("AllProducts",{products,categories});
      
    }

    const allProSearch=async(req,res)=>{  
      const name=req.query.product
      const products=await ProductModel.find({name: new RegExp(name,'i')}).lean()
      res.render('AllProducts',{products})
    }    
const sortProducts=async(req,res)=>{
  const name=req.query.sort   
  console.log(name)
if(name=="h to l"){
  const products =await ProductModel.find({status:true}).sort({price:-1}).lean()
  res.render('AllProducts',{products})
}
else if(name=="l to h"){
  const products =await ProductModel.find({status:true}).sort({price:1}).lean()
  res.render('AllProducts',{products})
}
else{
  const products =await ProductModel.find().lean()
  res.render('AllProducts',{products})
}
}


const filterProducts=async(req,res)=>{
  const name=req.query.filter
  console.log(name)
  const products=await ProductModel.find({$and:[{category:name},{status:true}]}).lean()
  res.render('AllProducts',{products})
}


const getForgetPassword=(req,res)=>{
  res.render('forgetPassword')
}

const forgetPassword=async(req,res)=>{
  // const email=req.body.email
  // const user=await UserModel.findOne({email})
  // if(user){
  //   console.log(email)
  //   res.render('UpdatePassword',{email})
  // }
  // else{
  //   const error="No such email found"
  //   res.render('forgetPassword',{error})
  // }
 const email=req.body.email
  const user=await UserModel.findOne({email}) 
  if(user){
    randomOtp=Math.floor(Math.random()*1000000)
      req.session.otp=randomOtp;
      console.log(randomOtp)

      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", // SMTP server address (usually mail.your-domain.com)
        port: 465, // Port for SMTP (usually 465)
        secure: true, // Usually true if connecting to port 465
        auth: {
          user: process.env.EMAIL, // Your email address
          pass: process.env.PASSWORD, // Password (for gmail, your app password)
        },

        
      });
      var mailOptions={
        from: process.env.EMAIL,
        to: req.body.email,
        subject: "Homekart Email verification",
        html: `
        <h1>Verify Your Email For HomeKart</h1>
          <h3>we got a request to update your password use this code to verify your password </h3>
          <h2>${randomOtp}</h2>
        `,
      }
  
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("email sent error ", error)
        } else {
          console.log("email sent successfull")
        }
      });
      res.render('passwordUpdateOtp',{email})
  }
  
  else{
    const error="No such email found"
    res.render('forgetPassword',{error})
  }
  
  
}

const verifyPasswordOtp=(req,res)=>{


  const email=req.body.email
  const otp=req.body.otp
  console.log(email)
  console.log(otp)
  if(otp==req.session.otp){
  res.render('UpdatePassword',{email})
  }
  else{
    const error="invalid otp"
    res.render('passwordUpdateOtp',{error,email})

  }
  
}

const updatePassword=async(req,res)=>{
  
  const email=req.body.email
  const password=req.body.password
  const confirmPassword=req.body.confirmPassword

  await UserModel.findOneAndUpdate({email:email},{$set:{password:password}})
  res.redirect('/login')
}

const getSingleProduct=async(req,res)=>{
  const _id=req.params.id
  const product=await ProductModel.findById({_id}).lean()
  const recomendedProducts=await ProductModel.find().limit(4).skip(6).lean()
  res.render('viewSingleProduct',{product,recomendedProducts})
  
}



const getReset=(req,res)=>{
  const name=req.params.name
  const email=req.params.email
  const PhoneNo=req.params.PhoneNo
  const password=req.params.password
  console.log(name,email,PhoneNo,password)
{
      randomOtp=Math.floor(Math.random()*1000000)
      req.session.otp=randomOtp;
      console.log(randomOtp)

    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // SMTP server address (usually mail.your-domain.com)
      port: 465, // Port for SMTP (usually 465)
      secure: true, // Usually true if connecting to port 465
      auth: {
        user: process.env.EMAIL, // Your email address
        pass: process.env.PASSWORD, // Password (for gmail, your app password)
      },
    });

      var mailOptions={
        from: process.env.EMAIL,
        to: email,
        subject: "Homekart Email verification",
        html: `
        <h1>Verify Your Email For HomeKart</h1>
          <h3>use this code to verify your email</h3>
          <h2>${randomOtp}</h2>
        `,
      }
  
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("email sent error ", error)
        } else {
          console.log("email sent successfull")
        }
      });
      res.render('resendOtp',{name,password,email,PhoneNo})
      
    }
  }
  
  const getCart=async(req,res)=>{
    if (req.session.user){
      const _id=req.session.user.id
      const {cart}=await UserModel.findOne({_id},{cart:1})
    const products=await ProductModel.find({_id:{$in:cart},status:true}).lean()
    let totalPrice=0;
    products.forEach((item)=>{
        totalPrice=totalPrice+item.price;
    })

    res.render('cart',{products,totalPrice})
    }
    else{
      res.redirect('/login')
    }
  }



  const getUserProfile=async(req,res)=>{
    if(req.session.user){
      const _id=req.session.user.id
      const user=await UserModel.findById({_id}).lean()
      const {address}=await UserModel.findOne({_id},{address:1})
      res.render('userProfile',{user,address})
    }else{
      res.redirect('/login')
    }
  }
  const getAddtoWishlist=async(req,res)=>{
    
    if (req.session.user){
      const _id=req.session.user.id
      const proId=req.params.id
      console.log(_id,proId)
      await UserModel.findByIdAndUpdate({_id},{$addToSet:{wishlist:proId}})
      res.redirect('back')
    }else{
      res.redirect('/login')
    }
    
  }

  const getWishlist=async(req,res)=>{
    if (req.session.user){
      const _id=req.session.user.id
      const {wishlist}=await UserModel.findOne({_id},{wishlist:1})
    const products=await ProductModel.find({_id:{$in:wishlist},status:true}).lean()
    res.render('wishlist',{products})
    }
    else{
      res.redirect('/login')
    }
  }
  const removeFromWishlist=async(req,res)=>{
    if (req.session.user){
      const _id=req.session.user.id
      const proId=req.params.id
      await UserModel.updateOne({_id},{$pull:{wishlist:proId}})
      res.redirect('back')
    }   
    else{
      res.redirect('/login')
    }
  }

  const getAddtoCart=async(req,res)=>{
    
    if (req.session.user){
      const _id=req.session.user.id
      const proId=req.params.id
      await UserModel.findByIdAndUpdate({_id},{$addToSet:{cart:proId}})
      res.redirect('back')
    }else{
      res.redirect('/login')
    }
    
  }

  const getCheckOut=async(req,res)=>{
    if(req.session.user){

      const _id=req.session.user.id
      const {cart}=await UserModel.findOne({_id},{cart:1})
      const products=await ProductModel.find({_id:{$in:cart},status:true}).lean()
      let totalPrice=0;
    products.forEach((item)=>{
        totalPrice=totalPrice+item.price;
    })

      res.render('checkOut',{products,totalPrice})
    }
    else{
      res.redirect('/login')
    }
  }

  const getRemoveFromCart=async(req,res)=>{
    if (req.session.user){
      const _id=req.session.user.id
      const proId=req.params.id
      await UserModel.updateOne({_id},{$pull:{cart:proId}})
      res.redirect('back')
    }   
    else{
      res.redirect('/login')
    }
  }


  const checkCoupon=async(req,res)=>{
    const _id=req.session.user.id
   const user= await UserModel.findOne({_id}).lean()
    const couponCode=req.body.coupon
    const coupon=await CouponModel.findOne({code:couponCode})
    const {cart}=await UserModel.findOne({_id},{cart:1})
    const products=await ProductModel.find({_id:{$in:cart},status:true}).lean()
    let totalPrice=0;
    products.forEach((item)=>{
        totalPrice=totalPrice+item.price;
    })

if(coupon){
  if(couponCode==coupon.code){
    const discount=coupon.discount
    let totalAmount=totalPrice-discount
    res.render('checkOut',{totalAmount,discount,products,totalPrice})
      }
}  else{
  res.redirect("back")
}  
   
    
  }

  const pay=(req,res)=>{
    res.render('succesfull')
  }


  const getAddAddress=(req,res)=>{
    
    const _id=Date.now()
    console.log(_id)
    if (req.session.user){
    res.render('AddAddress',{_id})
    }
    else{
      res.redirect('/login',)
    }
  }

  const addAddress=async(req,res)=>{
   
      const _id=req.session.user.id
      console.log(req.body)
      await UserModel.findByIdAndUpdate({_id},{$addToSet:{address:req.body}})
      res.redirect('/userProfile')
 
  }

  const getRemoveAddress=async(req,res)=>{

      const _id=req.session.user.id
      const addId=req.params.id
      console.log(addId)
      await UserModel.updateOne({_id,address:{$elemMatch:{id:addId}} },{
        $pull:{
            address:
                {
                    id:addId
                }
            
        }
    })
      res.redirect('back')

    
  }

  getUserOrders=(req,res)=>{
    res.render('UserOrder')
  }
module.exports={
    getUserHome, getUserLogin, getUserSignup, getOtp, verifyOTP, userLogin,
     userSignup, userLogout,getVerifyOTP,getCategoryFurniture,furnitureCategorySearch,
     getViewAllProducts,allProSearch,sortProducts,
     filterProducts,getForgetPassword,forgetPassword,verifyPasswordOtp,updatePassword,
     getSingleProduct,getReset,getCart,getWishlist,getUserProfile,getAddtoWishlist,removeFromWishlist,
     getAddtoCart,getCheckOut,getRemoveFromCart,checkCoupon,pay,getAddAddress,addAddress,getRemoveAddress,getUserOrders
}