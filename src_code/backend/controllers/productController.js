const Product = require("../models/product");
const search=require("../utils/elasticlurn")
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary");


// Get all products   =>   /api/v1/products?keyword=apple
exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  let objectQuery={}
  let productsCount;

  if(req.query?.price){
    objectQuery={...objectQuery,
      $and: [
        {price:{$lte:(req.query.price.lte)}},
        {price:{$gte:(req.query.price.gte)}}
       // So sánh nhỏ hơn hoặc bằng maxPrice
      ],
    }

  }
  if(req.query?.ratings){
    objectQuery={...objectQuery,
    ratings:{$gte:Number(req.query.ratings.gte)}
    }
  }
  if(req.query?.category){
    objectQuery={...objectQuery,
    category: {$in: req.query.category}
    }
  }
  let resPerPage=10
  productsCount = req.query.category 
    ? await Product.countDocuments({category: {$in: req.query.category}}) 
    : await Product.countDocuments();
  const currentPage = Number(req.query?.page) || 1;
  const skip = resPerPage * (currentPage - 1);
  let sort = {};
  if(req.query.sortByPrice) {
    sort.price = req.query.sortByPrice
  }
  let products = await Product.find(objectQuery).sort(sort).limit(resPerPage).skip(skip)
  let finalSearch
  if(req.query?.keyword) {
   const resultSearch=search(req.query.keyword,products)
    finalSearch=products.filter((product)=>{
      return resultSearch.find((result)=>{return result.ref.toString()==product._id.toString()})
    })
  }
  else finalSearch=products
  let filteredProductsCount = finalSearch.length;
  if(filteredProductsCount == 0) productsCount = 0
  res.status(200).json({
    success: true,
    productsCount,
    resPerPage,
    filteredProductsCount,
    products:finalSearch,
  });
});
// Get single product details   =>   /api/v1/product/:id
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});
// Create new review   =>   /api/v1/review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get Product Reviews   =>   /api/v1/reviews
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Product Review   =>   /api/v1/reviews
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);
  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.id.toString()
  );

  const numOfReviews = reviews.length;

  const ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});
