import transporter from "./node_mailer";

export default function sendOTP(email: string, otp: number) {
  transporter
    .sendMail({
      from: process.env.MAIL_USERNAME,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`,
    })
    .then((_) => console.log(_))
    .catch((err) => {
      console.log("Error Occured");
      console.error(err);
    });
}
