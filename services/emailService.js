import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";



// Email transporter
export const transporter = nodemailer.createTransport({
  host: process.env.SENDGRID_HOST,
  port: process.env.SENDGRID_PORT,
  secure: process.env.SENDGRID_SECURE,
  auth: {
    user: process.env.SENDGRID_USER, 
    pass: process.env.SENDGRID_API_KEY
  }
}); 

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Email connection failed:", error.message);
  } else {
    console.log("Email server is ready to take messages");
  }
});

// General sendMail function
export const sendMail = async ({ from, to, subject, html }) => {
  try {
    const info = await transporter.sendMail({ from, to, subject, html });
    console.log("Email sent!");
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
  }
};


// Verification link before full login
export const verifyAccountEmail = (email, verificationToken) => {
  const verificationLink = `${process.env.BASE_URL}/api/auth/verify-email?verificationToken=${verificationToken}`;

  return {
    from: `"Shopmate" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your Shopmate account",
    html: `
      <p>Please verify your account by clicking the link below:</p>
      <p><a href='${verificationLink}'>Verify Email</a></p>
      <p>This link will expire in 30 minutes.</p>
      <p>If the link doesn't work, copy and paste this URL into your browser:</p>
      <p>${verificationLink}</p>
      <p>To test manually in postman, Copy and paste <strong>${verificationToken}</strong> in postman</p>
      <br>
      <p>If you requested a new link, only the latest one will work</p>
    `
  };
};

// Successful account verification email
export const successfulVerificationEmail = (email, fullName) => ({
  from: `"Shopmate" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Account Successfully Verified 🎉",
  html: `<h1>Welcome to Shopmate, <strong>${fullName}</strong>! 🎉</h1>
         <br>
         <p>Your account has been successfully verified.</p>
         <p>We are excited to have you onboard and look forward to serving you.</p>
         <br/>
         <p>Happy shopping! 🛒</p>
         <p><strong>The Shopmate Team</strong></p>`
});

// Successful login email
export const successfulLoginEmail = (email, fullName) => ({
  from: `"Shopmate" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Successfully logged in!",
  html:
    `<h1>Welcome to Shopmate!😍</h1>
     <br>
     <h2> Hi <strong>${fullName},</strong> </h2>
     <p>You have successfully logged into your account</p>
     <p>Please proceed to shop!</p>
     <br>
     <p>The shopmate Team</p>
    `
});

// Password reset email
export const passwordResetEmail = (email, fullName, passwordToken) => {
  return {
    from: `"Shopmate Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <p>Hi <strong>${fullName},</strong></p>
      <p>We received a request to reset your password.</p>
      <p>Use the token below to reset it via the API (Postman or your client):</p>
      <p><b>${passwordToken}</b></p>
      <p>This token will expire in 15 minutes.</p>
      <p>If you did not make this request, please ignore this email.</p>
      <br>
      <p>The Shopmate Security Team</p>
    `
  };
};

// Successful password reset email
export const successfulPasswordReset = (email, fullName) => ({
  from: `"Shopmate Security" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Password Reset Successful",
  html: `
    <p>Hi <strong>${fullName},</strong></p>
    <p>Your password has been successfully reset.</p>
    <p>If you did not make this change, please reset it immediately and contact support.</p>
    <br>
    <p>The Shopmate Security Team</p>
  `
});

// Password change email
export const passwordChangeEmail = (email, fullName) => ({
  from: `"Shopmate Security" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Shopmate password change",
  html: ` <p>Hi <strong>${fullName},</strong><p>
          <p>This is to inform you that your password was changed successfully</p>
          <p>If you did not perform this action, please contact our support team immediately.</p>
          <br>
          <p>The Shopmate Security Team</p>
        `
});

// Successful admin creation
export const successfulAdminCreation = (email, fullName, password) => ({
  from: `"Shopmate Team" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Welcome to Shopmate - Admin Access",
  html: `
    <p>Hi <strong>${fullName},</strong></p>
    <p>Congratulations! You have been added as an <strong>Admin</strong> to Shopmate.</p>
    <p>Your login details are as follows:</p>
    <ul>
      <li>Email:<strong> ${email}</strong></li>
      <li>Password: <strong>${password}</strong></li>
    </ul>
    <p>Please change your password after your first login for security purposes.</p>
  `
});


// Account deletion confirmation email
export const accountDeletionConfirm = (email, fullName) => ({
  from: `"Shopmate Security" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Shopmate Account Deletion",
  html: ` <p>Hi <strong>${fullName},</strong></p>
          <p>This is to confirm that your Shopmate account has been successfully deleted</p>
          <p>If this was not you, please contact our support team immediately.</p>
          <br>
          <p>The Shopmate Security Team</p>
        `
});

// Order confirmation email
export const orderConfirmationEmail = (email, fullName, orderId, totalOrderPrice) => ({
    from: `"Shopmate Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your order has been received!",
    html: `
      <h2>Hi ${fullName},</h2>
      <br>
      <p>Thanks for shopping with us!</p>
      <p>We have received your order ${orderId}</p>
      <p>Total order amount: ${totalOrderPrice}
      <p>We will notify you once payment is confirmed.</p>
      <br>
      <p>Thank you</p>
      <p>The Shopmate Team</p>
      `
  });

// Successful order payment
export const successfulOrderPayment = (email, fullName, totalOrderPrice, orderId) => ({
  from: `"Shopmate Team" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Successful Order Payment",
  html: `
    <h2>Hi ${fullName},</h2>
    <br>
    <p>Your payment of ₦${totalOrderPrice} for Order #${orderId} was successful</p>
    <p>We are now preparing your order for shipment</p>
    <p>We will notify you once your order is shipped</p>
    <br>
    <p>Thank you for your trust,</p>
    <p>The Shopmate Team</p>
  `
});

// Notification on shipment/delivery
export const statusUpdateOnOrder= (email, orderStatus, fullName, orderId) => ({
  from: `"Shopmate Team" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: `Your order has been ${orderStatus}`,
  html: `
    <h2>Hi ${fullName},</h2>
    <br>
    <p>Good news! Your order ${orderId} has been ${orderStatus}</p>
    <p>Thank you for shopping with Shopmate</p>
    <br>
    <p>The Shopmate Team</p>
  `
});






          




      
      
