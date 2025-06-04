const signupCode = (
  code
) => `<div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 20px; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
      <div style="padding: 30px; text-align: center;">
        <h2 style="color: #4a90e2;">Email Verification</h2>
        <p style="font-size: 16px; margin-bottom: 30px;">Thank you for signing up. Use the code below to verify your email address:</p>
        <div style="font-size: 32px; font-weight: bold; color: #4a90e2; margin-bottom: 30px;">${code}</div>
        <p style="font-size: 14px; color: #777;">If you didn’t request this, you can safely ignore this email.</p>
      </div>
      <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #999;">
        &copy; 2025 Herdoy.dev. All rights reserved.
      </div>
    </div>
  </div>`;

export default signupCode;
