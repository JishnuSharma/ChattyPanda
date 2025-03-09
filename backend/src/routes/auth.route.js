import express from "express";
import { checkAuth, login, logout, signUp, updateProfile } from "../controllers/auth.controller.js";
import { protectedRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signUp);
router.post("/login",login);
router.post("/logout",logout);
router.post("/update-profile",protectedRoute, updateProfile);
router.get("/check-auth",protectedRoute,checkAuth);

export default router;