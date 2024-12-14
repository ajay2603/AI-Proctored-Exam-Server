import bcrypt from "bcryptjs";
import { Router } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import generateOTP from "../../utils/generate-otp";
import sendOTP from "../../utils/mail/send_otp";
import redis from "../../utils/redis";

const prisma = new PrismaClient();

const router = Router();

interface User {
  name: string;
  email: string;
  password: string;
}

router.post("/", async (req, res): Promise<any> => {
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
    const existingUser = await prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ message: "Email Already Registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const otp = generateOTP();
    const user: User = { name, email, password: hashedPassword };
    const redisUserData = { userDetails: user, otp };
    await redis.set(email, JSON.stringify(redisUserData), { EX: 300 });
    const date = Date.now() + 5 * 60 * 1000;
    sendOTP(email, otp);
    return res.status(200).json({ date, message: "Verify your email", email });
    //await prisma.user.create({ data: user });
    //return res.status(200).json({ message: "User created successfully" });
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

router.post("/verify-otp", async (req, res): Promise<any> => {
  const { email, otp } = req.body;
  try {
    const details: string = (await redis.get(email)) || "null";
    const redisUserData = JSON.parse(details);

    if (!redisUserData) {
      return res.status(410).json({ message: "OTP Expired" });
    }

    if (redisUserData.otp != otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = redisUserData.userDetails;

    await prisma.user.create({ data: user });
    redis.DUMP(user.email);
    return res.status(200).json({ message: "User created successfully" });
  } catch (err) {
    console.log("Error occured");
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
