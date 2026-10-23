import { config, mailConfigured } from "./config.ts";

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Version HTML du texte : paragraphes + liens cliquables. */
function toHtml(text: string) {
  const paragraphs = escapeHtml(text)
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\n/g, "<br>").replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')}</p>`);
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.55;color:#222">${paragraphs.join("")}</div>`;
}

/** Envoie un mail de prospection via l'API Resend. */
export async function sendMail(to: string, subject: string, body: string) {
  if (!mailConfigured()) {
    throw new Error("Envoi non configuré : renseignez RESEND_API_KEY et PROSPECT_FROM (adresse d'un domaine vérifié dans Resend) dans .env.local");
  }
  const fromName = [config.sender.name, config.sender.company].filter(Boolean).join(" — ");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.mail.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: config.mail.from.includes("<") ? config.mail.from : `${fromName} <${config.mail.from}>`,
      to: [to],
      reply_to: config.mail.replyTo,
      subject,
      text: body,
      html: toHtml(body),
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend a refusé l'envoi (${response.status}) : ${detail.slice(0, 300)}`);
  }
}
