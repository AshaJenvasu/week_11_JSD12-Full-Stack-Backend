import { Router } from "express";
import { router as usersRoutes } from "./user.route.js";
import { router as productsRoutes } from "./product.route.js";
// import { router as productsRoutes } from "./product.route.js";

export const router = Router();

router.use("/users", usersRoutes);
router.use("/products", productsRoutes);
// router.use("/notes", notesRoutes);
