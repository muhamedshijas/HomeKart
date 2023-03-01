const categoryModel = require("../models/CategoryModel")
const ProductModel = require("../models/ProductModel")
const hbs = require('express-handlebars')

const getCategoryFurniture = async (req, res) => {
   try{
    const name = req.query.category
    const products = await ProductModel.find({ $and: [{ category: name }, { status: true }] }).lean()
    res.render('categoryFurniture', { products, name })
   }catch{
    res.redirect('/error')
   }
  }

const furnitureCategorySearch = async (req, res) => {
   try{
    const name = req.body.product
    const proCategory = "furnitures"
    const products = await ProductModel.find({ $and: [{ name: new RegExp(name) }, { category: proCategory }, { status: true }] }).lean()
    res.render('categoryFurniture', { products })
   }catch{
    res.redirect('/error')
   }
  }

const getViewAllProducts = async (req, res) => {
    try{
      const pageNum = req.query.page
    const perPage = 8
    const categories = await categoryModel.find().lean()
    const products = await ProductModel.find({ status: true }).skip((pageNum - 1) * perPage).limit(perPage).lean()
    res.render("AllProducts", { products, categories });
    }
    catch{
      res.redirect('/error')
    }
  }

const allProSearch = async (req, res) => {
  try{
    console.log(req.query.product)
    const name = req.query.product
    const products = await ProductModel.find({ name: new RegExp(name, 'i'), status: true }).lean()
    res.render('AllProducts', { products })
  }catch{
    res.redirect('/error')
  }
  }
  
const sortProducts = async (req, res) => {
   try{
    const name = req.query.sort
    if (name == "h to l") {
      const products = await ProductModel.find({ status: true }).sort({ price: -1 }).lean()
      res.render('AllProducts', { products })
    }
    else if (name == "l to h") {
      const products = await ProductModel.find({ status: true }).sort({ price: 1 }).lean()
      res.render('AllProducts', { products })
    }
    else {
      const products = await ProductModel.find().lean()
      res.render('AllProducts', { products })
    }
   }catch{
    res.redirect('/error')
   }
  }
const filterProducts = async (req, res) => {
    try{
      const name = req.query.filter
    const products = await ProductModel.find({ $and: [{ category: name }, { status: true }] }).lean()
    res.render('AllProducts', { products })
    }catch{
      res.redirect('/error')
    }
  }

const getSingleProduct = async (req, res) => {
try{
  const _id = req.params.id
  const product = await ProductModel.findById({ _id }).lean()
  const recomendedProducts = await ProductModel.find({ status: true }).limit(4).skip(6).lean()
  res.render('viewSingleProduct', { product, recomendedProducts })
}catch{
  res.redirect('/error')
}
  }
  
module.exports = {getCategoryFurniture,furnitureCategorySearch,getViewAllProducts,allProSearch,sortProducts,filterProducts,getSingleProduct}