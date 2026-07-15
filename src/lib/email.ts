import nodemailer from "nodemailer";

export type SendEmailInput = {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html?: string;
};

const DEFAULT_CONTACT_EMAIL = "minhkhoi3110953@gmail.com";

export function getContactEmail() {
  return process.env.CONTACT_TO_EMAIL || DEFAULT_CONTACT_EMAIL;
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.CONTACT_FROM_EMAIL || user;

  if (!host || !user || !pass || !from || !Number.isFinite(port)) {
    return null;
  }

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: { user, pass },
    from,
  };
}

export function isEmailConfigured() {
  return Boolean(getSmtpConfig());
}

export async function sendEmail(input: SendEmailInput) {
  const config = getSmtpConfig();

  if (!config) {
    throw new Error(
      "Email service is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and CONTACT_FROM_EMAIL."
    );
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  return transporter.sendMail({
    from: config.from,
    to: input.to,
    replyTo: input.replyTo,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}
