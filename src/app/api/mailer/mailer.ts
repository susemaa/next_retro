import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function sendMail(request: Request) {

  const { to, subject, text } = await request.json();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_PASS,
    }
  });

  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
    to: to.join(", "),
    subject,
    text,
  };

  try {
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ status: 200, message: `Email sent to ${to}` });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ status: 500, error: `Error sending email to ${to}: ${error}` });
  }
}
