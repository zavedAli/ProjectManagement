import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const emailService = {
  async sendOTP(email: string, otp: string, name: string) {
    // Always log OTP in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n📧 OTP for ${email}: ${otp}\n`);
    }

    // If SendGrid not configured, skip email
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
      console.log('⚠️  SendGrid not configured, skipping email');
      return;
    }

    try {
      await sgMail.send({
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL,
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
    }
  },
};

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  // Always log in development
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n📧 Email to ${to}: ${subject}\n`);
  }

  // If SendGrid not configured, skip email
  if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
    console.log('⚠️  SendGrid not configured, skipping email');
    return;
  }

  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
  }
};
