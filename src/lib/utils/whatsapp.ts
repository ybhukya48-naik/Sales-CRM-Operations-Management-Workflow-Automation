/** Build a WhatsApp deep-link with a pre-filled message. */
export function buildWhatsAppDeepLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const text = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${text}`;
}

/** Replace {{placeholders}} in nurture templates. */
export function renderTemplate(
  body: string,
  vars: Record<string, string | null | undefined>
): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = vars[key];
    return value && value.trim() ? value : "";
  });
}
