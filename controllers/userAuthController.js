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
const getUserLogin = (req, res) => {
    try{
      if (!req.session.user) {
        res.render("UserLogin");
      } else {
        res.redirect("/");
      }
    }catch{
      res.redirect('/error')
    }
  }

const userLogin = async (req, res) => {
    try{
      const email = req.body.email
    if (req.body.email == "" || req.body.password == "") {
      const fillErr = "Please fill the requiered fields";
      res.render("UserLogin", { fillErr });
    } else {
      const { email, password } = req.body;
      const userOg = await UserModel.findOne({ email });
      if (userOg) {
        if (userOg.email == email && userOg.password == password) {
  
          req.session.user = { name: userOg.name, id: userOg._id, emailOg: userOg.email };
  
          res.redirect("/");
        } else {
          const loginErr = "invalid Username and Password";
          res.render("UserLogin", { loginErr });
        }
      } else {
        const noUser = "no user found"
        res.render('UserSignup', { noUser })
      }
    }
    }catch{
      res.redirect('/error')
    }
  }

const getUserSignup = async (req, res) => {
 try{
  res.render("UserSignup");
 }catch{
  res.redirect('/error')
 }
  }

const userSignup = async (req, res) => {
    try{
      const email = req.body.email
      const users= await UserModel.find({ban:true}).lean()
      console.log(users);
    const blockuser = await banUserModel.findOne({email:email})
    if (blockuser) {
  
      return res.render("UserSignup", { banErr: "You were banned!!!" })
    }
    const user = await UserModel.findOne({ email: req.body.email });
    if (user) {
      return res.render("UserSignup", { duplicate: "User already found  please Login" })
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
        randomOtp = Math.floor(Math.random() * 1000000)
        req.session.otp = randomOtp;
        let transporter = nodemailer.createTransport({
          host: "smtp.gmail.com", 
          port: 465,
          secure: true, 
          auth: {
            user: process.env.EMAIL, 
            pass: process.env.PASSWORD, 
          },
        });
        let mailOptions = {
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
        res.render("otpVerification", { ...req.body })
  
      }
    }
    }catch{
      res.redirect('/error')
    }
  }

const getOtp = (req, res) => {
    try{
      res.render('otpVerification')
    }catch{
      res.redirect('/error')
    }
  }

const verifyOTP = (req, res) => {
    const { name, email, password, PhoneNo } = req.body
    if (req.body.otp == req.session.otp) {
      const user = new UserModel({ name, email, PhoneNo, password });
      user.save((err, data) => {
        if (err) {
          res.render("otpVerification", { error: true, message: "Somethign went wrong", ...req.body })
        }
        else {
          res.redirect("/login");
        }
      });
    }
    else {
      res.render("otpVerification", { error: true, message: "Invalid OTP", ...req.body })
  
    }
  }
const getVerifyOTP = (req, res) => {
    res.render('otpVerification')
  }
const getForgetPassword = (req, res) => {
    res.render('forgetPassword')
  }
const forgetPassword = async (req, res) => {
    const email = req.body.email
    const user = await UserModel.findOne({ email })
    if (user) {
      randomOtp = Math.floor(Math.random() * 1000000)
      req.session.otp = randomOtp;
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", 
        port: 465, 
        secure: true, 
        auth: {
          user: process.env.EMAIL, 
            pass: process.env.PASSWORD,  
        },
  
  
      });
      let mailOptions = {
        from: "muhamedshijasm@gmail.com",
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
          console.log("email sent successfull"+randomOtp)
        }
      });
      res.render('passwordUpdateOtp', { email })
    }
    else {
      const error = "No such email found"
      res.render('forgetPassword', { error })
    }
  }
const verifyPasswordOtp = (req, res) => {
    const email = req.body.email
    const otp = req.body.otp
    if (otp == req.session.otp) {
      res.render('UpdatePassword', { email })
    }
    else {
      const error = "invalid otp"
      res.render('passwordUpdateOtp', { error, email })
    }
  }

const updatePassword = async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword
    await UserModel.findOneAndUpdate({ email: email }, { $set: { password: password } })
    res.redirect('/login')
  }

const getReset = (req, res) => {
    const name = req.params.name
    const email = req.params.email
    const PhoneNo = req.params.PhoneNo
    const password = req.params.password
    {
      randomOtp = Math.floor(Math.random() * 1000000)
      req.session.otp = randomOtp;
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com", 
        port: 465,
        secure: true, 
        auth: {
          user: process.env.EMAIL, 
            pass: process.env.PASSWORD, 
        },
      });
      let mailOptions = {
        from: "muhamedshijasm@gmail.com",
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
          console.log("email sent successfull"+randomOtp)
        }
      });
      res.render('resendOtp', { name, password, email, PhoneNo })
    }
  }

const userLogout = (req, res) => {
    req.session.user = null;
    res.redirect("/");
  }
module.exports = {getUserLogin,userLogin,getUserSignup,userSignup,getOtp,verifyOTP,getVerifyOTP,getForgetPassword,forgetPassword,verifyPasswordOtp,updatePassword,getReset,userLogout}        