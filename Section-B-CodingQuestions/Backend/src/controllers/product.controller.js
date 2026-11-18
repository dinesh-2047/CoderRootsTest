import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Product from "../models/product.model.js";

const createProduct = asyncHandler(async (req, res) => {
  const { name, price, stock, saleStartTime } = req.body;

  if (!name || price == null || !saleStartTime) {
    throw new ApiError(400, "Name, price, and saleStartTime are required");
  }

  const product = await Product.create({ name, price, stock, saleStartTime });

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

const getAllProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: "i" };
  }

  const [products, totalProducts] = await Promise.all([
    Product.find(filter).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalProducts / limit);

  return res.status(200).json(
    new ApiResponse(200, {
      products,
      currentPage: page,
      totalPages,
      totalProducts,
    }, "Products fetched successfully")
  );
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product fetched successfully"));
});

export { createProduct, getAllProducts, getProductById };
