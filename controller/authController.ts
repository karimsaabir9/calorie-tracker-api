import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "", { expiresIn: "30d" });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, dailyCalorieGoal } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const userExist = await User.findOne({ email: normalizedEmail });
    if (userExist) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Create new user
    const user = await User.create({
      email: normalizedEmail,
      password,
      name,
      dailyCalorieGoal: dailyCalorieGoal || 2000,
    });

    // Generate token
    res.status(201).json({
      message: "User created successfully",
      user: {
        email: user.email,
        name: user.name,
        dailyCalorieGoal: user.dailyCalorieGoal,
        token: generateToken(user._id.toString()),
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "All fields are required" });
    }
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );
    if (!user) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid email or password" });
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString());
    res.status(200).json({
      message: "Login successful",
      user: {
        email: user.email,
        name: user.name,
        dailyCalorieGoal: user.dailyCalorieGoal,
        token,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      message: "User fetched successfully",
      user: req.user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
      const { name, dailyColorieGoal, onboardingCompleted } = req.body || {};

      const user = await User.findById(req.user?._id).select("-password");

      if(!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      if(name) user.name = name;
      if(dailyColorieGoal) user.dailyCalorieGoal = dailyColorieGoal;
      if(onboardingCompleted !== undefined) user.onboardingCompleted = onboardingCompleted;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        dailyCalorieGoal: updatedUser.dailyCalorieGoal,
        onboardingCompleted: updatedUser.onboardingCompleted,
      });
  } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Internal server error" });
  }
}