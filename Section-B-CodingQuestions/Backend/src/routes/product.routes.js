import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
} from "../controllers/product.controller.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.route("/").get(getAllProducts);
router.route("/:id").get(getProductById);
router.route("/").post(VerifyJWT, authorizeRoles("admin"), createProduct);

export default router;
