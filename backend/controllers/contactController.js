const { sendEmail } = require("../services/emailService");

exports.submitContactForm = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and message",
      });
    }

    const emailSubject = subject ? `Contact Form: ${subject}` : `New Contact Form Submission from ${name}`;
    
    const emailHtml = `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject || "N/A"}</p>
      <hr/>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `;

    // Send to the admin/support email. We can use the EMAIL_USER from env as the recipient.
    await sendEmail(process.env.EMAIL_USER, emailSubject, emailHtml);

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    next(error);
  }
};
