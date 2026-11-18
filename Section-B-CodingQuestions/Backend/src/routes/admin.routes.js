import { Router } from "express";
import { getAnalytics } from "../controllers/admin.controller.js";
import { VerifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.route("/analytics").get(VerifyJWT, authorizeRoles("admin"), getAnalytics);

export default router;
