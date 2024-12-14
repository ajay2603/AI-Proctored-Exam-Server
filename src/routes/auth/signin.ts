import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.post("/", async (req, res): Promise<any> => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Found missing fields" });
  }

  try {
    const existingToken = req.cookies.token;

    if (existingToken) {
      prisma.validToken
        .delete({ where: { token: existingToken } })
        .catch(() => {});
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: "1d" }
    );

    const accessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_ACCESS_SECRET as string,
      {
        expiresIn: "30m",
      }
    );

    prisma.validToken.create({ data: { token: refreshToken } }).catch(() => {});

    res.cookie("token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res
      .status(200)
      .json({ message: "User logged in successfully", accessToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
