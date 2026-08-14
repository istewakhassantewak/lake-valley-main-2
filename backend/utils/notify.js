const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

/**
 * Sends a notification email. Never throws — a failed notification
 * should never break the API response to the visitor.
 */
async function notify(subject, text) {
  const t = getTransporter();
  const to = process.env.NOTIFY_EMAIL_TO;
  if (!t || !to) return;

  try {
    await t.sendMail({
      from: `"Lake Valley Website" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
    });
  } catch (err) {
    console.error('Email notification failed:', err.message);
  }
}

module.exports = notify;
