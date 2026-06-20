import { Resend } from 'resend'
import { getPurchaseReceiptHtml } from './templates/purchaseReceipt'

const resendApiKey = process.env.RESEND_API_KEY
const emailFrom = process.env.EMAIL_FROM || 'Flare <onboarding@resend.dev>'

// Only initialize Resend if the API key is configured
const resend = resendApiKey ? new Resend(resendApiKey) : null

interface SendTicketEmailProps {
  toEmail: string
  productTitle: string
  purchaseDate: string
  orderId: string | number
  price: number | string
  paymentMethod: string
  status: string
  productKey: string
}

export async function sendTicketEmail(props: SendTicketEmailProps): Promise<{ success: boolean; id?: string; error?: any }> {
  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const html = getPurchaseReceiptHtml({
    productTitle: props.productTitle,
    purchaseDate: props.purchaseDate,
    orderId: props.orderId,
    price: props.price,
    paymentMethod: props.paymentMethod,
    status: props.status,
    productKey: props.productKey,
    appUrl,
  })

  console.log(`[Email Service] Preparing to send digital key email to ${props.toEmail} for Order #${props.orderId}`)

  if (!resend) {
    console.warn('[Email Service Warning] RESEND_API_KEY is not configured. Logging email details to console instead:')
    console.log('====================================================')
    console.log(`To: ${props.toEmail}`)
    console.log(`From: ${emailFrom}`)
    console.log(`Subject: Ваш цифровой ключ для ${props.productTitle}`)
    console.log(`Key: ${props.productKey}`)
    console.log('====================================================')
    return { success: true, id: 'mock-email-id-logged' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: props.toEmail,
      subject: `Ваш цифровой ключ для ${props.productTitle}`,
      html,
    })

    if (error) {
      console.error('[Email Service Error] Failed to send email via Resend:', error)
      return { success: false, error }
    }

    console.log(`[Email Service Success] Email sent successfully via Resend. ID: ${data?.id}`)
    return { success: true, id: data?.id }
  } catch (error) {
    console.error('[Email Service Error] Exception occurred while sending email:', error)
    return { success: false, error }
  }
}
