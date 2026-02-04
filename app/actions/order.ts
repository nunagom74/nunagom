'use server'

import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { sendOrderEmail } from './email'

// Order Schema
const OrderSchema = z.object({
    customerName: z.string().min(1, "Name is required"),
    customerEmail: z.string().email("Invalid email").optional().or(z.literal('')),
    customerPhone: z.string().min(1, "Phone is required"),
    address: z.string().min(1, "Address is required"),
    detailAddress: z.string().optional(),
    message: z.string().optional(),
    // Allow single productId OR items array
    productId: z.string().optional(),
    quantity: z.coerce.number().optional(),
    items: z.string().optional(), // JSON string of items
})

export async function submitOrder(prevState: any, formData: FormData) {
    const result = OrderSchema.safeParse(Object.fromEntries(formData))

    if (!result.success) {
        const firstError = result.error.issues[0]?.message || "Please check your inputs."
        return { error: firstError }
    }

    const { customerName, customerEmail, customerPhone, address, detailAddress, message, productId, quantity, items } = result.data

    let orderItems: { productId: string, quantity: number, price: number }[] = []
    let totalAmount = 0
    let shippingFee = 3000 // Default, but should be max of items or fixed

    // Case 1: Single Item (Direct Buy)
    if (productId && quantity) {
        const product = await prisma.product.findUnique({ where: { id: productId } })
        if (!product) return { error: "Product not found" }
        orderItems.push({
            productId,
            quantity: quantity,
            price: product.price
        })
        totalAmount = product.price * quantity + product.shippingFee
        shippingFee = product.shippingFee
    }
    // Case 2: Cart Items
    else if (items) {
        try {
            const parsedItems = JSON.parse(items) as { id: string, quantity: number }[]

            for (const item of parsedItems) {
                const product = await prisma.product.findUnique({ where: { id: item.id } })
                if (!product) continue // Skip invalid products

                orderItems.push({
                    productId: item.id,
                    quantity: item.quantity,
                    price: product.price
                })
                totalAmount += product.price * item.quantity
                // Simple logic: Take max shipping fee or fixed? Let's use 3000 default or max. 
                // For MVP, just add highest shipping fee once or accumulate? 
                // Let's assume standard logic: Max shipping fee of all items (bundled shipping).
                shippingFee = Math.max(shippingFee, product.shippingFee)
            }
            totalAmount += shippingFee
        } catch (e) {
            return { error: "Invalid cart items" }
        }
    }

    if (orderItems.length === 0) {
        return { error: "No items to order" }
    }

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
                    create: orderItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    }))
                }
            }
        })

        // -- New: Auto-send Order Confirmation Email --
        if (customerEmail) {
            const orderIdShort = order.id.slice(0, 8).toUpperCase()
            const subject = `[누나곰] 주문이 확인되었습니다 (주문번호: #${orderIdShort})`
            const emailBody = `안녕하세요 ${customerName}님,\n\n누나곰을 찾아주셔서 감사합니다. 고객님의 주문이 성공적으로 접수되었습니다.\n\n첨부된 주문서를 확인해주시기 바라며, 배송이 시작되면 다시 안내해 드리겠습니다.\n\n감사합니다.\n누나곰 드림`

            // Send email asynchronously (don't block the user too long, but await to ensure it's fired)
            console.log(`Sending auto-confirmation email to ${customerEmail}...`)
            const emailResult = await sendOrderEmail(
                order.id,
                subject,
                emailBody,
                true // Attach Invoice PDF
            )

            if (!emailResult.success) {
                console.error("Failed to auto-send email:", emailResult.error)
            } else {
                console.log("Auto-confirmation email sent successfully.")
            }
        }
        // ---------------------------------------------

        // Return success with clearCart flag if needed, or redirect
    } catch (err) {
        console.error(err)
        return { error: "Failed to create order." }
    }

    redirect('/order/success?clearCart=true')
}


