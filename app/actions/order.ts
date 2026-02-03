'use server'

import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Order Schema
const OrderSchema = z.object({
    customerName: z.string().min(1, "Name is required"),
    customerEmail: z.string().email("Invalid email").optional().or(z.literal('')),
    customerPhone: z.string().min(1, "Phone is required"),
    address: z.string().min(1, "Address is required"),
    detailAddress: z.string().optional(),
    message: z.string().optional(),
    productId: z.string().min(1, "Product is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
})

export async function submitOrder(prevState: any, formData: FormData) {
    const result = OrderSchema.safeParse(Object.fromEntries(formData))

    if (!result.success) {
        // Return first error message
        const firstError = result.error.issues[0]?.message || "Please check your inputs."
        return { error: firstError }
    }

    const { customerName, customerEmail, customerPhone, address, detailAddress, message, productId, quantity } = result.data

    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) return { error: "Product not found" }

    const totalAmount = product.price * quantity + product.shippingFee

    try {
        const order = await prisma.order.create({
            data: {
                customerName,
                customerEmail: customerEmail || null,
                customerPhone,
                address,
                detailAddress,
                message,
                totalAmount,
                status: 'PENDING',
                items: {
                    create: {
                        productId,
                        quantity,
                        price: product.price,
                    }
                }
            }
        })

        // TODO: Send Email Notification via Resend (omitted for MVP unless API key provided)
        // console.log("Order created:", order.id)

    } catch (err) {
        console.error(err)
        return { error: "Failed to create order." }
    }

    redirect('/order/success')
}

// Inquiry Schema
const InquirySchema = z.object({
    name: z.string().min(1),
    contact: z.string().min(1),
    content: z.string().min(1),
})

export async function submitInquiry(prevState: any, formData: FormData) {
    const result = InquirySchema.safeParse(Object.fromEntries(formData))

    if (!result.success) return { error: "Invalid inputs" }

    await prisma.inquiry.create({
        data: result.data
    })

    redirect('/inquiry/success')
}
