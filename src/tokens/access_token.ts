import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
export default function authAccessToken(
  req: Request,
  res: Response,
  next: NextFunction
): any {
  const token = req.headers.authorization;
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    next("Unauthorized");
    return;
  }

  try {
    const paylode = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
    res.locals.jwtPayload = paylode;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: "Unauthorized" });
    next("Unauthorized");
    return;
  }
}
