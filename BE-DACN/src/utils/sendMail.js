import nodemailer from "nodemailer";
import { EMAIL_PASSWORD, EMAIL_USERNAME } from "../configs/enviroments.js";


const BRAND = {
  name: "Thế Giới Di Động",
  fromName: "Thế Giới Di Động Support",
  email: EMAIL_USERNAME,            // sẽ dùng WebsiteTheGioiDiDong@gmail.com
  hotline: "083.267.2005",
  primaryColor: "#0d6efd",
  lightBg: "#eff6ff",
  website: "http://localhost:5173", // đổi thành domain thật nếu có
};

// ✅ transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD,
  },
  // ⚠️ Chỉ dùng dev khi gặp TLS issue
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * ✅ Wrapper email dùng chung
 */
const wrapEmail = ({ title, subtitle, contentHtml }) => `
  <div style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #e5e7eb;">
    
    <!-- Header -->
    <div style="background-color: ${BRAND.primaryColor}; padding: 20px; text-align: center;">
      <h2 style="color: #ffffff; margin: 0; font-size: 22px;">${BRAND.name}</h2>
      <p style="color: #dbeafe; margin: 6px 0 0; font-size: 13px;">${subtitle || "Hệ thống bán lẻ công nghệ"}</p>
    </div>

    <!-- Body -->
    <div style="padding: 24px; color: #111827; line-height: 1.55;">
      <h3 style="margin: 0 0 12px; color: #111827; font-size: 18px;">${title}</h3>
      ${contentHtml}
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 16px; font-size: 12.5px; color: #6b7280; text-align: center;">
      <p style="margin: 0 0 6px;">Email này được gửi tự động. Vui lòng không trả lời email này.</p>
      <p style="margin: 0 0 6px;">📧 ${BRAND.email} &nbsp;|&nbsp; ☎ ${BRAND.hotline}</p>
      <p style="margin: 0;">© ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.</p>
    </div>
  </div>
`;

/**
 * ✅ UI helpers
 */
const otpBox = (otp) => `
  <div style="text-align: center; margin: 18px 0 10px;">
    <span style="
      display: inline-block;
      font-size: 28px;
      letter-spacing: 6px;
      font-weight: 800;
      color: ${BRAND.primaryColor};
      background-color: ${BRAND.lightBg};
      padding: 12px 22px;
      border-radius: 8px;
      border: 1px dashed #bfdbfe;
    ">${otp}</span>
  </div>
`;

const ctaButton = (text, href) => `
  <div style="margin-top: 18px; text-align: center;">
    <a href="${href}" style="
      display: inline-block;
      padding: 10px 18px;
      background-color: ${BRAND.primaryColor};
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
    ">${text}</a>
  </div>
`;

const statusColor = (statusUpper) => {
  if (["DELIVERED", "HOÀN THÀNH", "DONE", "SUCCESS"].includes(statusUpper)) return "#16a34a";
  if (["CANCELLED", "CANCELED", "ĐÃ HỦY"].includes(statusUpper)) return "#dc2626";
  if (["SHIPPING", "ĐANG GIAO"].includes(statusUpper)) return "#2563eb";
  return "#0f172a";
};

/**
 * ✅ sendEmail (giữ đúng API options = { text, html })
 */
const sendEmail = async (email, subject, options = {}) => {
  const { text, html } = options;

  const mailOptions = {
    from: `"${BRAND.fromName}" <${EMAIL_USERNAME}>`,
    to: email,
    subject,
    text: text || "Trình duyệt không hỗ trợ HTML.",
    html: html || text,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error("Error sending email: " + error.message);
  }
};

export default sendEmail;

// 1) OTP Verify Email
export const generateVerifyEmail = (username, otp) => {
  const contentHtml = `
    <p>Xin chào <strong>${username}</strong>,</p>
    <p>
      Cảm ơn bạn đã đăng ký tài khoản tại <strong>${BRAND.name}</strong>.
      Để hoàn tất đăng ký, vui lòng nhập mã xác thực bên dưới:
    </p>
    ${otpBox(otp)}
    <p style="margin-top: 10px;">
      ⏱ <strong>Mã có hiệu lực trong 15 phút.</strong><br/>
      Vui lòng không chia sẻ mã này cho bất kỳ ai.
    </p>
    <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
    <p style="margin-top: 14px;">Trân trọng,<br/><strong>Đội ngũ ${BRAND.name}</strong></p>
  `;

  return wrapEmail({
    title: "Xác thực tài khoản",
    subtitle: "Bảo mật tài khoản của bạn",
    contentHtml,
  });
};

// 2) Order Confirmation Email
export const generateOrderConfirmationEmail = (userName, orderId, totalAmount) => {
  const contentHtml = `
    <p>Xin chào <strong>${userName}</strong>,</p>
    <p>Chúng tôi đã nhận được đơn hàng của bạn và đang tiến hành xử lý.</p>

    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; margin: 14px 0;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; color: #374151;"><strong>🧾 Mã đơn hàng</strong></td>
          <td style="padding: 8px 0; text-align: right; color: #111827;">#${orderId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #374151;"><strong>💰 Tổng tiền</strong></td>
          <td style="padding: 8px 0; text-align: right; color: #ef4444; font-weight: 800;">
            ${Number(totalAmount || 0).toLocaleString()} VND
          </td>
        </tr>
      </table>
    </div>

    <p>Chúng tôi sẽ thông báo khi đơn hàng có cập nhật mới.</p>
    ${ctaButton("Xem đơn hàng", `${BRAND.website}/orders/${orderId}`)}

    <p style="margin-top: 16px; color: #6b7280; font-size: 13px;">
      Nếu bạn không thực hiện giao dịch này, vui lòng liên hệ ${BRAND.email}.
    </p>

    <p style="margin-top: 14px;">Trân trọng,<br/><strong>Đội ngũ ${BRAND.name}</strong></p>
  `;

  return wrapEmail({
    title: "Xác nhận đặt hàng thành công",
    subtitle: "Cảm ơn bạn đã mua sắm cùng chúng tôi",
    contentHtml,
  });
};

// 3) Order Status Email
export const generateOrderStatusEmail = (name, orderId, status) => {
  const statusUpper = String(status || "").toUpperCase();
  const color = statusColor(statusUpper);

  const contentHtml = `
    <p>Xin chào <strong>${name}</strong>,</p>
    <p>Đơn hàng <strong>#${orderId}</strong> của bạn vừa được cập nhật trạng thái:</p>

    <div style="margin: 14px 0; text-align: center;">
      <span style="
        display: inline-block;
        padding: 10px 14px;
        border-radius: 999px;
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        color: ${color};
        font-weight: 800;
        font-size: 14px;
      ">
        ${statusUpper}
      </span>
    </div>

    <p>Bạn có thể xem chi tiết đơn hàng tại:</p>
    ${ctaButton("Xem chi tiết đơn hàng", `${BRAND.website}/orders/${orderId}`)}

    <p style="margin-top: 14px;">Trân trọng,<br/><strong>Đội ngũ ${BRAND.name}</strong></p>
  `;

  return wrapEmail({
    title: "Cập nhật trạng thái đơn hàng",
    subtitle: "Thông tin đơn hàng của bạn",
    contentHtml,
  });
};

// 4) Password Changed Email (đồng bộ style)
export const generatePasswordChangedEmail = (username = "bạn") => {
  const contentHtml = `
    <p>Xin chào <strong>${username}</strong>,</p>
    <p>Mật khẩu tài khoản của bạn vừa được thay đổi <strong>thành công</strong>.</p>

    <div style="margin: 14px 0; padding: 12px; border-radius: 10px; border: 1px solid #fde68a; background: #fffbeb; color: #92400e;">
      <strong>⚠️ Lưu ý bảo mật:</strong> Nếu bạn KHÔNG thực hiện thao tác này, vui lòng liên hệ ngay để đảm bảo an toàn tài khoản.
    </div>

    <p>Bạn có thể đăng nhập lại để kiểm tra tài khoản.</p>
    ${ctaButton("Đăng nhập", `${BRAND.website}/login`)}

    <p style="margin-top: 14px;">Trân trọng,<br/><strong>Đội ngũ ${BRAND.name}</strong></p>
  `;

  return wrapEmail({
    title: "Thay đổi mật khẩu thành công",
    subtitle: "Thông báo bảo mật",
    contentHtml,
  });
};
