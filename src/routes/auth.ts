import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Router } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import authRefreshToken from "../tokens/refresh_token";

const prisma = new PrismaClient();
const router = Router();

interface User {
  name: string;
  email: string;
  password: string;
}

router.post("/sign-up", async (req, res): Promise<any> => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: "Found missing fields" });
  }

  if (password !== confirmPassword || !password) {
    return res
      .status(400)
      .json({ message: "Password and confirm password must be the same" });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user: User = { name, email, password: hashedPassword };
    await prisma.user.create({ data: user });
    return res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(400).json({ message: "Email is already exists" });
      }
    }

    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/sign-in", async (req, res): Promise<any> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Found missing fields" });
  }

  try {
    const existingToken = req.cookies.token;

    if (existingToken) {
      prisma.validTokens
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

    prisma.validTokens
      .create({ data: { token: refreshToken } })
      .catch(() => {});

    res.cookie("token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res
      .status(200)
      .json({ message: "User logged in successfully", accessToken });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post(
  "/token-refresh",
  authRefreshToken,
  async (req, res): Promise<any> => {
    const paylode = res.locals.jwtPayload;
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
      await prisma.validTokens.create({ data: { token: refreshToken } });
      res.cookie("token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      return res
        .status(200)
        .json({ message: "Token refreshed successfully", accessToken });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
