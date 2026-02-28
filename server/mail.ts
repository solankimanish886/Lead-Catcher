import nodemailer from "nodemailer";

export async function sendResetEmail(email: string, token: string) {
    const resetLink = `${process.env.CLIENT_URL || "http://localhost:5000"}/reset-password?token=${token}`;

    // Configure transporter (using a mock or Ethereal for now if no auth provided)
    // In production, user should provide SMTP credentials in .env
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.ethereal.email",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER || "mock_user",
            pass: process.env.SMTP_PASS || "mock_pass",
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM || '"Lead Catcher" <noreply@leadcatcher.com>',
        to: email,
        subject: 'Reset Your Lead Catcher Password',
        html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 24px;">
        <h2 style="color: #001E2B; font-weight: 900; font-size: 24px;">Reset Your Password</h2>
        <p style="color: #5C6C75; line-height: 1.6;">Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetLink}" 
           style="display:inline-block; background:#00ED64; color:#001E2B; 
                  padding:14px 28px; border-radius:12px; font-weight:900; 
                  text-decoration:none; margin:16px 0; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">
          Reset Password
        </a>
        <p style="color:#94a3b8; font-size:12px; margin-top: 24px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Reset email sent to ${email}`);
        // If using ethereal, log the URL
        if (process.env.SMTP_HOST === "smtp.ethereal.email") {
            console.log("Mock email sent. Check ethereal.email if using real credentials.");
        }
    } catch (error) {
        console.error("Error sending reset email:", error);
        throw new Error("Failed to send reset email");
    }
}
