import redis from "../../utils/redis";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function ValidateOTPController(
  req: Request,
  res: Response
): Promise<any> {
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
}
