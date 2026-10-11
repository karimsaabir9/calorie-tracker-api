import express from "express";
import { login, register, me } from "../controller/authController.js";
import { protect } from "../middleware/auth.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me)

export default router;