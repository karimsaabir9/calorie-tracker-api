import express from "express";
import { login, register, me, updateProfile } from "../controller/authController.js";
import { protect } from "../middleware/auth.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, me)
router.put("/update-profile", protect, updateProfile)

export default router;