import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const emailService = {
  async sendOTP(email: string, otp: string, name: string) {
    // If SMTP not configured, log to console (dev mode)
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`\n📧 OTP Email (SMTP not configured):\nTo: ${email}\nCode: ${otp}\n`);
      return;
    }

    try {
      const mailOptions = {
        from: `"Project Management" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Verify your email - Project Management Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome ${name}!</h2>
            <p>Your verification code is:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      console.log(`📧 FALLBACK - OTP for ${email}: ${otp}`);
      // Don't throw - allow registration to continue, user can use resend
    }
  },
};
