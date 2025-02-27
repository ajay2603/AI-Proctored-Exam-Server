import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
const prisma = new PrismaClient();

export default async function RefreshTokenController(
  req: Request,
  res: Response
): Promise<any> {
  const paylode = res.locals.jwtPayload;
  try {
    const user = await prisma.user.findFirst({
      where: { id: paylode.id },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }

  const accessToken = jwt.sign(
    { id: paylode.id },
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: "30m" }
  );
  const refreshToken = jwt.sign(
    { id: paylode.id },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: "1d" }
  );

  try {
    prisma.validToken.create({ data: { token: refreshToken } }).catch(() => {});
    res.cookie("token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    return res
      .status(200)
      .json({ message: "Token refreshed successfully", accessToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
