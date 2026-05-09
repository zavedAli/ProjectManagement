import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  async sendOTP(email: string, otp: string, name: string) {
    // If Resend not configured, log to console (dev mode)
    if (!process.env.RESEND_API_KEY) {
      console.log(`\n📧 OTP Email (Resend not configured):\nTo: ${email}\nCode: ${otp}\n`);
      return;
    }

    try {
      await resend.emails.send({
        from: 'Project Management <onboarding@resend.dev>',
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
      });
      console.log(`✅ OTP email sent to ${email}`);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`📧 FALLBACK - OTP for ${email}: ${otp}`);
      }
    }
  },
};
