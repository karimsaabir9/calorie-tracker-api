import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User.js";

// extend the request interface to include the user object
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  let token: string | undefined;

  // check if the token is in the headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      if (!token) {
        res.status(401).json({ message: "Unauthorized, no token provided" });
        return;
      }

      // verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as {
        id: string;
      };

      // get user from the database
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        res.status(401).json({ message: "Unauthorized, invalid token" });
        return;
      }
      req.user = user;
      next();
    } catch (error) {
      console.error("Error verifying token:", error);
      res.status(500).json({ message: "Unauthorized, invalid token" });
      return;
    }
  } else {
    res.status(401).json({ message: "Unauthorized, no token provided" });
    return;
  }
};
