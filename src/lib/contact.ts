/**
 * Contact form delivery through EmailJS, the same account, service and
 * template the previous site used, so messages keep landing in the same
 * inbox. These are EmailJS's browser-side public credentials, meant to ship
 * to the client; the REST endpoint replaces the old site's script tag.
 */
const EMAILJS = {
  endpoint: "https://api.emailjs.com/api/v1.0/email/send",
  serviceId: "service_9hdv3nu",
  templateId: "template_3k5amts",
  publicKey: "dvKSuSLEjskV-yjTk",
};

export type ContactMessage = { name: string; email: string; phone: string; message: string };

/** The template reads `name`, `email`, `phone` and `message`, as the old form's fields did. */
export async function sendContactMessage(fields: ContactMessage): Promise<void> {
  const response = await fetch(EMAILJS.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: EMAILJS.serviceId,
      template_id: EMAILJS.templateId,
      user_id: EMAILJS.publicKey,
      template_params: fields,
    }),
  });
  if (!response.ok) throw new Error(`EmailJS ${response.status}: ${await response.text()}`);
}

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** 10-digit US numbers with optional +1 and formatting, as on the old form. */
export const phonePattern = /^(?:\+1\s?)?(?:\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})$/;
