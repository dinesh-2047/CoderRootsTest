import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

const checkout = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!items || !items.length) {
    throw new ApiError(400, "Items are required");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const { productId, quantity } = item;

      const product = await Product.findById(productId).session(session);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(404, `Product not found`);
      }

      if (Date.now() < new Date(product.saleStartTime).getTime()) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(403, "Sale has not started");
      }

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true, session }
      );

      if (!updatedProduct) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(409, `Insufficient stock for ${product.name}`);
      }

      orderItems.push({
        product: productId,
        name: product.name,
        price: product.price,
        quantity,
      });

      totalAmount += product.price * quantity;
    }

    const order = await Order.create(
      [
        {
          user: req.user._id,
          items: orderItems,
          totalAmount,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res
      .status(201)
      .json(new ApiResponse(201, order[0], "Order placed successfully"));
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    throw error;
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [orders, totalOrders] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments({ user: req.user._id }),
  ]);

  const totalPages = Math.ceil(totalOrders / limit);

  return res.status(200).json(
    new ApiResponse(200, {
      orders,
      currentPage: page,
      totalPages,
      totalOrders,
    }, "Orders fetched successfully")
  );
});

const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.search) {
    if (mongoose.Types.ObjectId.isValid(req.query.search)) {
      filter.$or = [
        { _id: req.query.search },
        { user: req.query.search },
      ];
    }
  }

  const [orders, totalOrders] = await Promise.all([
    Order.find(filter)
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalOrders / limit);

  return res.status(200).json(
    new ApiResponse(200, {
      orders,
      currentPage: page,
      totalPages,
      totalOrders,
    }, "Orders fetched successfully")
  );
});

const VALID_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
};

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.status === "DELIVERED" || order.status === "CANCELLED") {
    throw new ApiError(400, "Cannot modify a delivered or cancelled order");
  }

  const allowedTransitions = VALID_TRANSITIONS[order.status];
  if (!allowedTransitions || !allowedTransitions.includes(status)) {
    throw new ApiError(400, `Invalid transition from ${order.status} to ${status}`);
  }

 // cancel restore stock  ;
  if (status === "CANCELLED") {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }
  }

  order.status = status;
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated successfully"));
});

export { checkout, getMyOrders, getAllOrders, updateOrderStatus };
