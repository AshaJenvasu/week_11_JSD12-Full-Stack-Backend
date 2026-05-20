import { Router } from "express";
import { loginUser } from "../../modules/auth/auth.controller.js";

export const router = Router();

router.post("/login", loginUser);
