'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { sendEmail } from '@/app/actions/email'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { containsProfanity } from '@/lib/profanity'

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

    // Spam/Profanity Check
    if (containsProfanity(name) || containsProfanity(content)) {
        return { error: "부적절한 내용이 포함되어 있어 등록할 수 없습니다." }
    }

    try {
        await prisma.inquiry.create({
            data: {
                name,
                contact,
                content
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
