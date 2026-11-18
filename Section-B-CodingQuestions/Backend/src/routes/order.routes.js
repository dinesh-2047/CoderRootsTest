import { Router } from "express";
import {
  checkout,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.route("/checkout").post(VerifyJWT, authorizeRoles("customer"), checkout);
router.route("/my-orders").get(VerifyJWT, getMyOrders);
router.route("/").get(VerifyJWT, authorizeRoles("admin"), getAllOrders);
router.route("/:id/status").patch(VerifyJWT, authorizeRoles("admin"), updateOrderStatus);

export default router;
