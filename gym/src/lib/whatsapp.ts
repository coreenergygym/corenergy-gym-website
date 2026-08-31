/**
 * Builds a standard WhatsApp click-to-chat link (wa.me).
 * This is NOT the WhatsApp Business API — it just opens WhatsApp
 * with a pre-filled message. The person still has to hit send.
 */
export function buildWhatsAppLink(phoneWithCountryCode: string, message: string): string {
  const digitsOnly = phoneWithCountryCode.replace(/[^\d]/g, '')
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${digitsOnly}?text=${encoded}`
}

export function openWhatsApp(phoneWithCountryCode: string, message: string) {
  const link = buildWhatsAppLink(phoneWithCountryCode, message)
  window.open(link, '_blank', 'noopener,noreferrer')
}

export function appointmentMessage(details: {
  name: string
  phone: string
  service: string
  date: string
  time: string
  message?: string
}): string {
  return [
    'New Appointment Booking',
    `Name: ${details.name}`,
    `Phone: ${details.phone}`,
    `Service: ${details.service}`,
    `Date: ${details.date}`,
    `Time: ${details.time}`,
    `Message: ${details.message || '-'}`,
  ].join('\n')
}

export function registrationMessage(details: {
  name: string
  phone: string
  plan: string
  startDate?: string
}): string {
  return [
    'New Membership Registration',
    `Name: ${details.name}`,
    `Phone: ${details.phone}`,
    `Plan: ${details.plan}`,
    `Preferred Start: ${details.startDate || '-'}`,
  ].join('\n')
}
