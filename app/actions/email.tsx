'use server'

import { prisma } from '@/lib/db'
import { Resend } from 'resend'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/pdf/invoice-pdf'
import React from 'react'

import nodemailer from 'nodemailer'

const resend = new Resend(process.env.RESEND_API_KEY)

interface Attachment {
    filename: string
    content: Buffer
}

/**
 * Generic function to send email via Gmail SMTP (preferred if configured) or Resend
 */
export async function sendEmail({
    to,
    subject,
    text,
    html,
    attachments = []
}: {
    to: string,
    subject: string,
    text?: string,
    html?: string,
    attachments?: Attachment[]
}) {
    // 1. Try sending via Gmail SMTP if configured
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_APP_PASSWORD,
                },
            })

            await transporter.sendMail({
                from: `"Nuna Gom" <${process.env.GMAIL_USER}>`,
                to: to,
                subject: subject,
                text: text,
                html: html || `<p>${text?.replace(/\n/g, '<br>')}</p>`,
                attachments: attachments.map(att => ({
                    filename: att.filename,
                    content: att.content
                }))
            })
            return { success: true }
        } catch (error) {
            console.error('Gmail send error:', error)
            // Fallback to Resend or just fail? For clarity, let's return error here 
            // so we don't accidentally send via Resend if user intended Gmail.
            return { success: false, error: 'Gmail sending failed: ' + (error as Error).message }
        }
    }

    // 2. Fallback to Resend
    // Check for API Key
    if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY is missing')
        return { success: false, error: 'Server configuration error: Missing Email API Key (Resend)' }
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Nuna Gom <onboarding@resend.dev>',
            to: [to],
            subject: subject,
            text: text,
            html: html || `<p>${text?.replace(/\n/g, '<br>')}</p>`, // Ensure HTML is provided
            attachments
        })

        if (error) {
            console.error('Resend error:', error)
            return { success: false, error: error.message }
        }
        return { success: true }
    } catch (error) {
        console.error('Failed to send email:', error)
        return { success: false, error: 'Failed to send email' }
    }
}

export async function sendOrderEmail(
    orderId: string,
    subject: string,
    message: string,
    attachInvoice: boolean
) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: true } } }
        })

        if (!order) {
            return { success: false, error: 'Order not found' }
        }

        const attachments: Attachment[] = []

        if (attachInvoice) {
            try {
                // Generate PDF Buffer
                const pdfBuffer = await renderToBuffer(<InvoicePDF order={order} />)
                attachments.push({
                    filename: `Invoice-${order.id}.pdf`,
                    content: pdfBuffer
                })
            } catch (pdfError) {
                console.error("Failed to generate PDF:", pdfError)
            }
        }

        return await sendEmail({
            to: order.customerEmail || 'delivered@resend.dev',
            subject,
            html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
            attachments
        })
    } catch (error) {
        console.error('Failed to send order email:', error)
        return { success: false, error: 'Failed to send order email' }
    }
}
