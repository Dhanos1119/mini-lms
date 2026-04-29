const nodemailer = require("nodemailer");

// ✅ Create transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password only
  },
});

// ✅ Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ SMTP ERROR:", error);
  } else {
    console.log("✅ SMTP SERVER READY");
  }
});

// 📧 Send Student Credentials Email
const sendCredentialsEmail = async (email, name, password) => {
  try {
    console.log("📧 Sending credentials email to:", email);

    const mailOptions = {
      from: `"LMS Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to LMS - Your Account Credentials",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
          <h2 style="color: #2563eb;">Welcome to Mini LMS, ${name}!</h2>

          <p>Your account has been successfully created. You can now log in using the following credentials:</p>

          <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p><strong>Email:</strong> ${email}</p>
            <p>
              <strong>Temporary Password:</strong> 
              <span style="font-family: monospace; font-weight: bold; background: #eee; padding: 2px 5px;">
                ${password}
              </span>
            </p>
          </div>

          <p style="margin-top: 20px;">Please log in and change your password immediately.</p>

          <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/login"
             style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
             Login to Dashboard
          </a>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Credentials email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Error sending credentials email:", error);
    throw error;
  }
};

// 🔑 Send Reset Password Email
const sendResetPasswordEmail = async (email, token) => {
  try {
    console.log("📧 Sending reset email to:", email);

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const resetLink = `${clientUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"LMS Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "LMS Password Reset Request",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>

          <p>You requested to reset your password. Click the button below to set a new one:</p>

          <a href="${resetLink}"
             style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">
             Reset Password
          </a>

          <p>If you did not request this, you can safely ignore this email. This link will expire in 1 hour.</p>

          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">

          <p style="font-size: 12px; color: #777;">If the button does not work, copy and paste this link:</p>
          <p style="font-size: 11px; color: #777;">${resetLink}</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Reset email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Error sending reset email:", error);
    throw error;
  }
};

// 📚 Send Assignment Email
const sendAssignmentEmail = async ({
  email,
  studentName,
  assignmentTitle,
  assignmentDescription,
  batchName,
  dueDate,
}) => {
  try {
    console.log("📧 Sending assignment email to:", email);

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

    const formattedDueDate = dueDate
      ? new Date(dueDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Not specified";

    const mailOptions = {
      from: `"LMS Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `New Assignment Assigned - ${assignmentTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
          <h2 style="color: #2563eb;">New Assignment Assigned</h2>

          <p>Hello ${studentName || "Student"},</p>

          <p>A new assignment has been assigned to your batch. Please check the details below:</p>

          <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p><strong>Assignment Name:</strong> ${assignmentTitle}</p>
            <p><strong>Batch:</strong> ${batchName}</p>
            <p><strong>Due Date:</strong> ${formattedDueDate}</p>
            <p><strong>Description:</strong> ${
              assignmentDescription || "No description provided."
            }</p>
          </div>

          <p style="margin-top: 20px;">Please log in to your LMS account and complete the assignment before the due date.</p>

          <a href="${clientUrl}/login"
             style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
             Login to Dashboard
          </a>

          <p style="margin-top: 25px; font-size: 13px; color: #777;">
            Thank you,<br/>
            LMS Admin
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Assignment email sent:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Error sending assignment email:", error);
    throw error;
  }
};

module.exports = {
  sendCredentialsEmail,
  sendResetPasswordEmail,
  sendAssignmentEmail,
};