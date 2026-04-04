const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const { v4: uuidv4 } = require("uuid"); // tạo ID duy nhất (unique identifier) theo chuẩn UUID.

// Config transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ================= SEND EMAIL CORE =================
const sendHtmlEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    throw new Error("Send email failed: " + error.message);
  }
};

// ================= TEMPLATE RENDER =================
const renderTemplate = async (templateName, data) => {
  const filePath = path.join(
    __dirname,
    "../templates/email",
    `${templateName}.ejs`,
  );

  return await ejs.renderFile(filePath, data);
};

// ================= HELPER =================
const appendTrackingId = (html) => {
  return (
    html +
    `<div style="display:none; max-height:0; overflow:hidden;">
      Ref: ${uuidv4()}
    </div>`
  );
};

// ================= EMAIL FUNCTIONS =================
const sendOtpEmail = async (to, otp) => {
  const html = await renderTemplate("otp-email", {
    otp,
    expire: 5,
  });

  await sendHtmlEmail(to, "Your OTP Code", appendTrackingId(html));
};

const sendOrderPaidEmail = async (to, order) => {
  let html = await renderTemplate("order-paid-email", { order });

  const subject = `[GienCar] Xác nhận thanh toán đơn hàng ${order.orderCode}`;

  await sendHtmlEmail(to, subject, appendTrackingId(html));
};

const sendOrderConfirmedEmail = async (to, order) => {
  let html = await renderTemplate("order-confirmed-email", { order });

  const subject = `[GienCar] Đơn hàng ${order.orderCode} đã được xác nhận`;

  await sendHtmlEmail(to, subject, appendTrackingId(html));
};

const sendBookingConfirmedEmail = async (to, booking, carName, carImageUrl) => {
  let html = await renderTemplate("booking-confirmed-email", {
    booking,
    carName,
    carImageUrl,
  });

  const subject = "[GienCar] Lịch lái thử của bạn đã được xác nhận";

  await sendHtmlEmail(to, subject, appendTrackingId(html));
};

const sendBookingFailedEmail = async (
  to,
  booking,
  reason,
  carName,
  carImageUrl,
) => {
  let html = await renderTemplate("booking-failed-email", {
    booking,
    reason,
    carName,
    carImageUrl,
  });

  const subject = "[GienCar] Thông báo về lịch đăng ký lái thử";

  await sendHtmlEmail(to, subject, appendTrackingId(html));
};

module.exports = {
  sendOtpEmail,
  sendOrderPaidEmail,
  sendOrderConfirmedEmail,
  sendBookingConfirmedEmail,
  sendBookingFailedEmail,
};
