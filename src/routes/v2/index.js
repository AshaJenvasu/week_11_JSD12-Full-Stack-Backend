import { Router } from "express";
import { router as usersRoutes } from "./user.route.js";
import { router as productsRoutes } from "./product.route.js";
import { router as registerRoutes } from "./register.route.js";
import { router as authRoutes } from "./auth.route.js";

export const router = Router();

router.use("/users", usersRoutes);
router.use("/products", productsRoutes);
router.use("/register", registerRoutes);
router.use("/auth", authRoutes);
// router.use("/notes", notesRoutes);
