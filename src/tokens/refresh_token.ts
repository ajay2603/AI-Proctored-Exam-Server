import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function authRefreshToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const token = req.cookies.refreshToken; // Assuming token is stored in a cookie

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const paylode = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);
    res.locals.jwtPayload = paylode;
    prisma.validTokens.delete({ where: { token } }).catch(() => {});
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
