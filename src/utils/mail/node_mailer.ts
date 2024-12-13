import nodeMailer from "nodemailer";

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

export default transporter;