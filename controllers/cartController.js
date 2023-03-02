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

const getCart = async (req, res) => {
    const _id = req.session.user.id
    const { cart } = await UserModel.findOne({ _id }, { cart: 1 })
    if (cart == "") {
      noItem = "No items Found"
      res.render('cart', { noItem })
    }
    const cartQuantities = {}
    const cartItems = cart.map(item => {
      cartQuantities[item.id] = item.quantity
      return item.id
    })
    const products = await ProductModel.find({ _id: { $in: cartItems } }).lean()
    let totalPrice = 0;
    const pro = products.map((item, index) => {
      totalPrice = totalPrice + item.price * cartQuantities[item._id];
      return { ...item, cartQuantity: cartQuantities[item._id] }
    })
    const prod = products.map((item, index) => {
      return { quantity: cartQuantities[item._id] }
    })
    totalAmount = 40 + totalPrice
    res.render('cart', { products: pro, totalPrice, totalAmount })
  }

const getAddtoCart = async (req, res) => {

    if (req.session.user) {
      const _id = req.session.user.id
      const proId = req.params.id
      await UserModel.findByIdAndUpdate({ _id }, {
        $addToSet: {
          cart: {
            id: proId,
            quantity: 1
          }
        }
      })
      res.redirect('/cart')
    } else {
      res.redirect('/login')
    }
  }
const getRemoveFromCart = async (req, res) => {
    if (req.session.user) {
      const _id = req.session.user.id
      const proId = req.params.id
      await UserModel.updateOne({ _id }, { $pull: { cart: { id: proId } } })
      res.redirect('back')
    }
    else {
      res.redirect('/login')
    }
  }

const getCheckOut = async (req, res) => {
    if (req.session.user) {
      const _id = req.session.user.id
      const user = await UserModel.findOne({ _id }).lean()
      const { address } = await UserModel.findOne({ _id }, { address: 1 })
      const { cart } = await UserModel.findOne({ _id }, { cart: 1 })
      if (cart == "") {
        res.redirect("back")
      }
      const cartQuantities = {}
      let cartItems = cart.map(item => {
        cartQuantities[item.id] = item.quantity;
        return item.id
  
      })
      const products = await ProductModel.find({ _id: { $in: cartItems } }).lean()
      let totalPrice = 0;
      const pro = products.map((item, index) => {
        totalPrice = totalPrice + (item.price * cartQuantities[item._id]);
        return { item, quantity: cartQuantities[item._id] }
  
      })
      const amount = totalPrice + 40
      const totalAmount = amount
      res.render('checkOut', { products, totalPrice, address, totalAmount, amount, user })
    }
    else {
      res.redirect('/login')
    }
  }

const addQuantity = async (req, res) => {
    const product = await ProductModel.findOne({ _id: req.params.id }, { name: 1 }).lean()
    await UserModel.updateOne({ _id: req.session.user.id, cart: { $elemMatch: { id: req.params.id } } }, {
      $inc: {
        "cart.$.quantity": 1
      }
    })
    return res.redirect("/cart")
  }

const minusQuantity = async (req, res) => {
    let { cart } = await UserModel.findOne({ "cart.id": req.params.id }, { _id: 0, cart: { $elemMatch: { id: req.params.id } } })
    if (cart[0].quantity <= 1) {
      return res.redirect("/cart")
    }
    await UserModel.updateOne({ _id: req.session.user.id, cart: { $elemMatch: { id: req.params.id } } }, {
      $inc: {
        "cart.$.quantity": -1
      }
    })
    return res.redirect("/cart")
  }

const checkOut = async (req, res) => {
    _id = req.session.user.id
    const address = req.body.address
    if (address) {
      let newAddress = await UserModel.findOne({ _id }, { _id: 0, address: { $elemMatch: { id: address } } })
      const user = await UserModel.findOne({ _id }).lean()
      const { cart } = await UserModel.findOne({ _id }, { cart: 1 })
      const cartQuantities = {}
      let cartItems = cart.map(item => {
        cartQuantities[item.id] = item.quantity;
        return item.id
      })
      const products = await ProductModel.find({ _id: { $in: cartItems } }).lean()
      let totalPrice = 0;
      const pro = products.map((item, index) => {
        totalPrice = totalPrice + item.price * cartQuantities[item._id];
        return { item, cartQuantity: cart[index].quantity }
      })
      req.session.userAddress = {
        id: newAddress.address[0].id
      }
      const code = req.body.couponCode
      let coupon = await CouponModel.findOne({ code }).lean()
      if (coupon) {
        req.session.coupon = {
          code: code
        }
      }
      const wallet = req.body.wallet
      if (wallet) {
        req.session.wallet = {
          wallet: wallet
        }
      }
      const payment = req.body.Payment

      console.log(payment)
      if (payment == "online")
       {
        if(req.session.coupon){
          var discount=coupon.discount
          totalPrice=totalPrice-discount
        }
        if(req.session.wallet){
          if(totalPrice>req.session.wallet.wallet){
            totalPrice=totalPrice-req.session.wallet.wallet
          }
          else{
            totalPrice=0
          }
        }

        let orderId = "order_" + Date.now().toString(36) + Math.random().toString(36).substr(2);
        const options = {
          method: "POST",
          url: "https://sandbox.cashfree.com/pg/orders",
          headers: {
            accept: "application/json",
            "x-api-version": "2022-09-01",
            "x-client-id": process.env.cashFreeAppID,
            "x-client-secret":process.env.cashFreeSceretKey,
            "content-type": "application/json",
          },
          data: {
            order_id: orderId,
            order_amount: totalPrice + 40,
            order_currency: "INR",
            customer_details: {
              customer_id: req.session.user.id,
              customer_name: user.name,
              customer_email: user.email,
              customer_phone: newAddress.address[0].phone,
            },
            order_meta: {
              return_url: "https://homekart.store/return?order_id={order_id}",
            },
          },
        };
        await axios
          .request(options)
          .then(function (response) {
            return res.render("paymentScreen", {
              orderId,
              sessionId: response.data.payment_session_id,
            });
          })
          .catch(function (error) {
            console.error(error);
          });
      }
      else {
        let orders = []
        let i = 0
        for (let item of products) {
          await ProductModel.updateOne({ _id: item._id }, {
            $inc: {
              quantity: (-1 * cart[i].quantity)
            }
          })
  
          totalPrice = (cart[i].quantity * item.price) + 40
          if (coupon) {
            console.log(coupon)
            var discount = coupon.discount
            totalPrice = totalPrice - discount
          }
          const wallet = req.body.wallet
          if (wallet) {
            await UserModel.findOneAndUpdate({ _id: req.session.user.id }, { $inc: { wallet: -totalPrice } })
            totalPrice = wallet - totalPrice
            if (totalPrice < 0) {
              {
                totalPrice = -1 * totalPrice
                await UserModel.findOneAndUpdate({ _id: req.session.user.id }, { $set: { wallet: 0 } })
              }
            }
            else {
              totalPrice = 0
            }
          }
          orders.push({
            address: newAddress.address[0],
            user:newAddress.address[0].name,
            orderItems: item,
            userId: req.session.user.id,
            totalPrice: totalPrice,
            quantity: cart[i].quantity,
            paymentType: payment,
            discount: discount
          })
          i++
        }
        const order = await OrderModel.create(orders)
        await UserModel.findByIdAndUpdate(req.session.user.id, { $set: { cart: [] } })
        res.render('succesfull')
      }
    }
    else {
      const noAddress = "choose a address"
      const { cart } = await UserModel.findOne({ _id }, { cart: 1 })
      const cartItems = cart.map(item => {
        return item.id
      })
      const products = await ProductModel.find({ _id: { $in: cartItems } }).lean()
      let { address } = await UserModel.findOne({ _id }, { address: 1 })
      let totalPrice = 0;
      const pro = products.map((item, index) => {
        totalPrice = (totalPrice + item.price) * cart[index].quantity;
        return { item, quantity: cart[index].quantity }
      })
      const totalAmount = totalPrice + 40
      const discount = 0.00
      res.render('checkOut', { totalAmount, discount, products, totalPrice, address, noAddress })
    }
  }


const paymentReturnURL = async (req, res) => {
    try {
      const order_id = req.query.order_id;
      const options = {
        method: "GET",
        url: "https://sandbox.cashfree.com/pg/orders/" + order_id,
        headers: {
          accept: "application/json",
          "x-api-version": "2022-09-01",
          "x-client-id": process.env.cashFreeAppID,
          "x-client-secret":process.env.cashFreeSceretKey,
          "content-type": "application/json",
        },
      };
  
      const response = await axios.request(options);
      console.log(response.data.order_status)
      if (response.data.order_status == "PAID") {
        console.log(response.data.order_status)
        const _id = req.session.user.id
        const user = await UserModel.findOne({ _id }).lean()
        const { cart } = await UserModel.findOne({ _id }, { cart: 1 })
        const cartQuantities = {}
        let cartItems = cart.map(item => {
          cartQuantities[item.id] = item.quantity;
          return item.id
  
        })
        const products = await ProductModel.find({ _id: { $in: cartItems } }).lean()
        let totalPrice = 0;
  
        const pro = products.map((item, index) => {
          totalPrice = totalPrice + item.price * cartQuantities[item._id];
          return { item, cartQuantity: cart[index].quantity }
  
        })
        const address = req.session.userAddress.id
        let newAddress = await UserModel.findOne({ _id }, { _id: 0, address: { $elemMatch: { id: address } } })
        const wallet = req.body.wallet
        const payment = "online"
        let orders = []
        let i = 0
        for (let item of products) {
          await ProductModel.updateOne({ _id: item._id }, {
            $inc: {
              quantity: (-1 * cart[i].quantity)
            }
          })
          totalPrice = (cart[i].quantity * item.price) + 40
          let discount
          if (req.session.coupon) {
            let couponCode = req.session.coupon.code
            const coupon = await CouponModel.findOne({ code: couponCode })
             discount = coupon.discount
            totalPrice = totalPrice - discount
          }
          if (req.session.wallet) {
            const wallet = req.session.wallet.wallet
            const _id = req.session.user.id
            await UserModel.findOneAndUpdate({ _id: req.session.user.id }, { $inc: { wallet: -totalPrice } })
            totalPrice = wallet - totalPrice
            if (totalPrice < 0) {
              {
                totalPrice = -1 * totalPrice
                await UserModel.findOneAndUpdate({ _id: req.session.user.id }, { $set: { wallet: 0 } })
              }
            }
            else {
              totalPrice = 0
            }
          }
          req.session.coupon = null;
          orders.push({
            address: newAddress.address[0],
            user:newAddress.address[0].name,
            orderItems: item,
            userId: req.session.user.id,
            totalPrice: totalPrice,
            quantity: cart[i].quantity,
            paymentType: payment,
            discount:discount
          })
          i++
        }
        const order = await OrderModel.create(orders)
        await UserModel.findByIdAndUpdate(req.session.user.id, { $set: { cart: [] } })
        req.session.userAddress = null
        return res.render("succesfull")
      } 
      else 
      {
        return res.send("payment failed")
        console.log("error")
      }
    } 
      catch (err) {
      console.log(err)
      return res.send("payment failed")
    }
}
const getApplyCoupon = (req, res) => {
  res.render('coupon')
}
const applyCoupon = async (req, res) => {
  const code = req.body.coupon
  const couponOg = await CouponModel.findOne({ code }).lean()
    if (couponOg) {
    if (couponOg.expiryDate >= Date.now()) {
      const success = "coupon Applied successfully"
      const couponCode = couponOg.code
      const _id = req.session.user.id
      let discount = couponOg.discount
      const noAddress = "choose a address"
      const { cart } = await UserModel.findOne({ _id }, { cart: 1 })
      const cartItems = cart.map(item => {
        return item.id
      })
      const products = await ProductModel.find({ _id: { $in: cartItems } }).lean()
      let { address } = await UserModel.findOne({ _id }, { address: 1 })
      let totalPrice = 0;
      const pro = products.map((item, index) => {
        totalPrice = (totalPrice + item.price) * cart[index].quantity;
        return { item, quantity: cart[index].quantity }

      })
      const amount = totalPrice + 40
      const totalAmount = amount - discount
      res.render('checkOut', { totalAmount, discount, products, totalPrice, address, success, couponCode, amount })
    }
    else {
      const expired = "coupon expired"
      res.render('coupon', { expired })
    }

   } else {
    const _id = req.session.user.id
    const noAddress = "choose a address"
    const { cart } = await UserModel.findOne({ _id }, { cart: 1 })
    const cartItems = cart.map(item => {
      return item.id
    })
    const products = await ProductModel.find({ _id: { $in: cartItems } }).lean()
    let { address } = await UserModel.findOne({ _id }, { address: 1 })
    let totalPrice = 0;
    const pro = products.map((item, index) => {
      totalPrice = (totalPrice + item.price) * cart[index].quantity;
      return { item, quantity: cart[index].quantity }
    })
    const noCoupon = "No coupon Available"
    const totalAmount = (totalPrice + 40)
    res.render('checkOut', { totalAmount, products, totalPrice, address, noAddress, noCoupon })
  }
}
module.exports = {getCart,getAddtoCart,getRemoveFromCart,getCheckOut,checkOut,addQuantity,minusQuantity,paymentReturnURL,getApplyCoupon,applyCoupon}