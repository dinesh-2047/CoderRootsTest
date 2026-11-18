import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Order from "../models/order.model.js";

const getAnalytics = asyncHandler(async (req, res) => {
  const [revenueResult, topProducts, ordersByStatus] = await Promise.all([
    // Total revenue (excluding cancelled orders)
    Order.aggregate([
      { $match: { status: { $ne: "CANCELLED" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]),

    // Top 3 products by quantity sold
    Order.aggregate([
      { $match: { status: { $ne: "CANCELLED" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 3 },
    ]),

    // Order count by status
    Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  return res.status(200).json(
    new ApiResponse(200, {
      totalRevenue,
      topProducts,
      ordersByStatus,
    }, "Analytics fetched successfully")
  );
});

export { getAnalytics };
