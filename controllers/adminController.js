const AdminModel = require("../models/AdminModel");
const UserModel = require("../models/UserModel");
const banUserModel = require("../models/banUserModel");
const categoryModel=require("../models/CategoryModel")
const ProductModel=require("../models/ProductModel")
const OrderModel=require("../models/OrderModel")
const CouponModel=require('../models/CouponModel')  
const BannerModel=require('../models/BannerModel')
const multer=require('multer')
const userRouter=require('../routers/UserRouter')




const getAdminHome=(req,res)=>{
    if(req.session.admin){
        res.render('AdminHome')
    }else{
        res.redirect('/admin/login')
    }
}
 const getAdminUser=async(req,res)=>{
    if(req.session.admin)
    {
        const userData= await UserModel.find({ban:false}).lean()
        res.render("AdminUser",{userData})
    }
    else{
        res.redirect('/admin/login')   
    }  
}
const getAdminLogin=(req,res)=>{
    if(req.session.admin){
        res.redirect('/admin')
    }
    else{
        res.render('AdminLogin')
    } 
}
const adminLogin=async(req,res)=>{
    if(req.body.email==""||req.body.password=="")
    {
        const adminFillErr="please Fill the requiered fields"
        res.render('AdminLogin',{adminFillErr})
    }
    else{
        const {email,password}=req.body
        const adminOg=await AdminModel.findOne({email})
        if(adminOg){
         if(adminOg.email==email&&adminOg.password==password){
            req.session.admin={
                name:adminOg.name,
                _id:adminOg._id
            }
             res.redirect('/admin')
         }
         else{
             res.send("errr")
         }
        }
        else{
         const adminErr="Invalid email and password"
         res.render('AdminLogin',{adminErr})
        }
    }
}

const getDeleteUser=(req,res)=>{
    const _id=req.params.id;
    UserModel.deleteOne({_id})
    .then(()=>{
        console.log("deleted")
        userDeleted=true;
        
       if (_id==req.session.user.id)
       {console.log(req.session.user.id)
        console.log(_id);
        req.session.user=null
       }
       res.redirect('/admin/user')
    })
    .catch((err)=>{
        console.log("error is"+err)
    })
}

const getBanUser=async(req,res)=>{
    console.log("hiiiiii")
    const _id=req.params.id
    console.log(_id)
    
    await UserModel.findByIdAndUpdate({_id},{$set:{ban:true}})
    res.redirect('/admin/user')
         
}

const getAdminBanned=async(req,res)=>{
    if(req.session.admin){
        const banData=await UserModel.find({ban:true}).lean()
        res.render('BannedUsers',{banData})
    }
    else{
        res.redirect('/admin/login')
    }
}

const getUnbanUser=async (req,res)=>{
  const _id=req.params.id
    await UserModel.findByIdAndUpdate({_id},{$set:{ban:false}})
    res.redirect('/admin/banned')
}

const searchUser=async(req,res)=>{
    const name=req.body.name
    const userData=await UserModel.find({name:new RegExp(name)}).lean()
    res.render('AdminUser',{userData})
  }

const getadminLogout=(req,res)=>{
    req.session.admin=null
    res.redirect('/admin/login')
  }


const getProduct=async(req,res)=>{
    if(req.session.admin){
        const products= await ProductModel.find().lean()
        res.render('AdminProducts',{products})
    }
    else{
        res.redirect('/admin/login')
    }
  }


const getAddCategory=(req,res)=>{
    res.render('AddCategory')
  }

  const addCategory=async(req,res)=>{
    const category=req.body.category
    const newCategory=await categoryModel.findOne({category:category})
    if(newCategory){
        const errMsg="Category Already found"
        res.render('AddCategory',{errMsg})
    }
    else{
        const categories= new categoryModel({category})
        categories.save();
        res.redirect('/admin/category')
    }
   
}

const getAddProduct=async(req,res)=>{
    const category=await categoryModel.find().lean()

    res.render("AddProduct",{category})
}

const addProduct=(req,res)=>{
    console.log(req.files)
    ProductModel.create({
       name:req.body.name,
       product:req.files.image,
       productSub:req.files.subImages,  
       category:req.body.category,
       price:req.body.price,
       quantity:req.body.quantity,
       description:req.body.description
   
    }).then((products)=>{
       console.log(products)
       res.redirect('/admin/product')
    }).catch((Error)=>{
        console.log(Error)
        res.render('AddProduct')
    })
   }
const getDeleteProduct=async(req,res)=>{
    const _id=req.params.id;
    await ProductModel.findByIdAndUpdate({_id},{$set:{status:false}})
    res.redirect('/admin/product')

}

const getEditProduct=async(req,res)=>{
    const _id=req.params.id
    const productDetials=await ProductModel.findOne({_id}).lean()
    const category=await categoryModel.find().lean()
    res.render('EditProduct',{productDetials,category})
}


const editProduct=async(req,res)=>{
    const _id=req.body._id
    if(req.file?.filename){
        await ProductModel.findByIdAndUpdate(_id,{$set:{
            name:req.body.name,
            product:req.file.filename,
            category:req.body.category,
            price:req.body.price,
            quantity:req.body.quantity,
            description:req.body.description
        }})
    }else{
        await ProductModel.findByIdAndUpdate(_id,{$set:{
            name:req.body.name,
            category:req.body.category,
            price:req.body.price,
            quantity:req.body.quantity,
            description:req.body.description
        }})
    }
    
    res.redirect('/admin/product')
}

const searchProduct=async(req,res)=>{
    const name=req.body.name
    const products=await ProductModel.find({name:new RegExp(name)}).lean()
    res.render('AdminProducts',{products})
  
  }

const getCategory=async(req,res)=>{

    const categories=await categoryModel.find().lean()
    
        res.render('AdminCategory',{categories})
    }

    const deleteCategory=(req,res)=>{
        const _id=req.params.id;
        categoryModel.deleteOne({_id})
        .then(()=>{
            console.log("deleted")
            categoryDeleted=true;
            res.redirect('/admin/category')
        })
        .catch((err)=>{
            console.log("error is"+err)
        })
    }
    
    const getOrder=(req,res)=>{
        res.render('AdminOrder')
    }

  

    const getEditCategory=async(req,res)=>{
        const _id=req.params.id
        
        const category=await categoryModel.findOne({_id}).lean()
        console.log(category)
        res.render('editCategory',{category})
    }

    const editCategory=async(req,res)=>{
        const _id=req.body._id
        const category=req.body.category
        await categoryModel.findByIdAndUpdate(_id,{$set:{category:req.body.category}})
        await ProductModel.findOneAndUpdate(category,{$set:{category:req.body.category}})
        res.redirect('/admin/category')
    }

    const getOrders=async(req,res)=>{
        const orders=await OrderModel.find().lean()
        var totalcount=await OrderModel.find().lean().countDocuments()
        var pendingCount=await OrderModel.find({status:"pending"}).lean().countDocuments()
        var deliveredCount=await OrderModel.find({status:"Delivered"}).lean().countDocuments()
        var cancelCount=await OrderModel.find({status:"Cancelled"}).lean().countDocuments()
        res.render('AdminOrder',{orders,totalcount,pendingCount,deliveredCount,cancelCount})
    }

    const searchOrders=async(req,res)=>{
        const name=req.body.name
        console.log(name)
        const orders=await OrderModel.find({user: new RegExp(name,'i')}).lean()
        var totalcount=await OrderModel.find().lean().countDocuments()
        var pendingCount=await OrderModel.find({status:"pending"}).lean().countDocuments()
        var deliveredCount=await OrderModel.find({status:"Delivered"}).lean().countDocuments()
        var cancelCount=await OrderModel.find({status:"Cancelled"}).lean().countDocuments()
        res.render('AdminOrder',{orders,totalcount,pendingCount,deliveredCount,cancelCount})
    }

    const getChangeStatus=async(req,res)=>{
        const _id=req.params.id;
        const order=await OrderModel.findOne({_id}).lean()
        res.render('changeStatus',{order})
    }

    const changeStatus=async(req,res)=>{
        const _id=req.body._id
        const newStatus=req.body.status
        console.log(_id)

        await OrderModel.findByIdAndUpdate(_id,{$set:{status:newStatus}})
        res.redirect('/admin/orders')
    }

    const getUnListedProducts=async(req,res)=>{
        const unListedproducts=await ProductModel.find({status:false}).lean()
        res.render('UnListedProducts',{unListedproducts})
    }

    const getList=async(req,res)=>{
        const _id=req.params.id
        await ProductModel.findByIdAndUpdate({_id},{$set:{status:true}})
        res.redirect('/admin/product')
    }

    const getCoupons=async(req,res)=>{
        const couponsArr=await CouponModel.find().lean()
        let coupons=couponsArr.map(item=>{
            return {...item, expiryDate:item.expiryDate.toLocaleString()}
        })
      
        res.render('AdminCoupon',{coupons})
    }

    const getAddcoupon=(req,res)=>{
        res.render('AddCoupons')
    }
    
    const couponAdd =(req,res)=>{
        const name=req.body.name
        const code=req.body.code
        const expiryDate=req.body.expiry
        const discount=req.body.Discount
        

        const coupons= new CouponModel({name,code,expiryDate,discount})
        coupons.save()
        res.redirect('/admin/coupons')
    }

const getdeleteCoupon=async(req,res)=>{
    const _id=req.params.id
    await CouponModel.findByIdAndDelete({_id})
    res.redirect('/admin/coupons')
}


const getBanner=async(req,res)=>{
    const banners=await BannerModel.find().lean()
    res.render('AdminBanner',{banners})
}

const getAddBanner=(req,res)=>{
    res.render('AddBanner')
}

const bannerAdd=(req,res)=>{
    const name=req.body.name
    const banner=req.file.filename
    const banners= new BannerModel({name,banner})
    banners.save()
    res.redirect('/admin/banner')
}

const getBannerDelete=async(req,res)=>{
    const _id=req.params.id
    await BannerModel.findByIdAndDelete({_id})
    res.redirect('/admin/banner')
}


    module.exports={
        getAddCategory,getAddProduct,getAdminBanned,getAdminHome,getAdminLogin,getAdminUser,getBanUser,addCategory,addProduct
        ,getDeleteProduct,getDeleteUser,getEditProduct,getProduct,getUnbanUser,getadminLogout,adminLogin,deleteCategory,
        searchProduct,searchUser,editProduct,getCategory,getOrder,getBanner,getEditCategory,editCategory,getOrders,searchOrders,
        getChangeStatus,changeStatus,getUnListedProducts,getList,getCoupons,getAddcoupon,couponAdd,getdeleteCoupon,getAddBanner
        ,bannerAdd,getBannerDelete

    }
    
































