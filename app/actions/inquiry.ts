'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/app/actions/email'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { containsProfanity } from '@/lib/profanity'
import { headers } from 'next/headers'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface ReplyOptions {
    sendEmail?: boolean
    emailSubject?: string
    emailContent?: string
    emailAddress?: string
}

// Inquiry Schema
const InquirySchema = z.object({
    name: z.string().min(1),
    contact: z.string().min(1),
    content: z.string().min(1),
    website: z.string().optional(), // Honeypot
})

export async function submitInquiry(prevState: any, formData: FormData) {
    const result = InquirySchema.safeParse(Object.fromEntries(formData))

    if (!result.success) return { error: "Invalid inputs" }

    const { name, content, website, contact } = result.data

    // Honeypot Check (Spam Prevention)
    if (website) {
        // If honeypot is filled, simulate success but do nothing
        return { success: true }
    }

    // ---------------------------------------------------------
    // 0. Cloudflare Turnstile Verification (Smart Captcha)
    // ---------------------------------------------------------
    const turnstileToken = formData.get('cf-turnstile-response')
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY

    // Only skip if secret is not configured (dev mode), effectively optional if key is missing
    if (turnstileSecret && turnstileToken) {
        const verifyFormData = new FormData()
        verifyFormData.append('secret', turnstileSecret)
        verifyFormData.append('response', turnstileToken as string)

        try {
            const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                body: verifyFormData,
            })
            const turnstileResult = await turnstileRes.json()
            if (!turnstileResult.success) {
                return { error: "캡차 인증에 실패했습니다. 다시 시도해 주세요." }
            }
        } catch (error) {
            console.error("Turnstile check failed:", error)
            // If API fails, allow it to proceed or block based on strictness. Here we allow.
        }
    }

    // ---------------------------------------------------------
    // 1. Rate Limiting (DoS Protection)
    // ---------------------------------------------------------
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 'unknown'

    // Check limits: Max 3 inquiries per 10 minutes per IP
    if (ip !== 'unknown') {
        const recentCount = await prisma.inquiry.count({
            where: {
                ipAddress: ip,
                createdAt: {
                    gte: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
                }
            }
        })

        if (recentCount >= 3) {
            return { error: "잠시 후 다시 시도해주세요. (문의 허용량 초과)" }
        }
    }

    // ---------------------------------------------------------
    // 2. Simple Keyword Check (Cost: Free)
    // ---------------------------------------------------------
    if (containsProfanity(name) || containsProfanity(content)) {
        return { error: "부적절한 내용이 포함되어 있어 등록할 수 없습니다." }
    }

    // ---------------------------------------------------------
    // 3. AI Spam Check (Cost: FREE with Google Gemini)
    // ---------------------------------------------------------
    const geminiKey = process.env.GEMINI_API_KEY
    if (geminiKey) {
        try {
            const genAI = new GoogleGenerativeAI(geminiKey)
            const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" })

            const prompt = `
            You are a spam filter for a customer support form.
            Check if the following message contains spam, hate speech, illegal content, or malicious advertising.
            
            Name: ${name}
            Message: ${content}

            Reply only with 'SPAM' or 'SAFE'.
            `

            const result = await model.generateContent(prompt)
            const decision = result.response.text().trim().toUpperCase()

            if (decision.includes('SPAM')) {
                return { error: "부적절한 내용이 감지되어 차단되었습니다." }
            }
        } catch (error) {
            console.error("Gemini Check Failed (failing open):", error)
            // Failsafe: Allow
        }
    }

    try {
        await prisma.inquiry.create({
            data: {
                name,
                contact,
                content,
                ipAddress: ip
            }
        })
    } catch (error) {
        console.error("Failed to create inquiry:", error)
        return { error: "문의 등록에 실패했습니다. 다시 시도해 주세요." }
    }

    // Instead of redirect, we return success so the client can show a message
    return { success: true }
}

export async function replyToInquiry(id: string, answer: string, options?: ReplyOptions) {
    try {
        // 1. Update DB first
        const inquiry = await prisma.inquiry.update({
            where: { id },
            data: {
                answer,
                isReplied: true,
                repliedAt: new Date(),
            },
        })

        // 2. Send Email if requested
        if (options?.sendEmail) {
            const recipient = options.emailAddress || inquiry.contact

            // Simple email validation check
            if (!recipient.includes('@')) {
                return { success: true, emailSent: false, error: 'Invalid email address' }
            }

            const subject = options.emailSubject || `[Nuna Gom] Reply to your inquiry`
            // Use provided email content or falling back to db answer
            const htmlContent = (options.emailContent || answer).replace(/\n/g, '<br>')

            const emailResult = await sendEmail({
                to: recipient,
                subject: subject,
                html: htmlContent
            })

            if (!emailResult.success) {
                return { success: true, emailSent: false, error: emailResult.error }
            }
            return { success: true, emailSent: true }
        }

        revalidatePath('/admin/inquiries')
        return { success: true }
    } catch (error) {
        console.error('Failed to reply to inquiry:', error)
        return { success: false, error: 'Failed to save reply' }
    }
}

export async function deleteInquiry(id: string) {
    try {
        await prisma.inquiry.delete({
            where: { id }
        })

        revalidatePath('/admin/inquiries')
        return { success: true }
    } catch (error) {
        console.error("Failed to delete inquiry:", error)
        return { success: false, error: "Failed to delete inquiry" }
    }
}
