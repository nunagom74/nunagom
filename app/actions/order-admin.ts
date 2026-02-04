'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { OrderStatus } from '@prisma/client'

export async function updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    trackingData?: { carrier?: string, trackingNumber?: string }
) {
    try {
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status,
                ...(trackingData || {})
            }
        })
        revalidatePath('/admin/orders')
        revalidatePath('/admin/orders')
        return { success: true }
    } catch (error) {
        console.error('Failed to update order status:', error)
        return { error: `Failed to update status: ${error instanceof Error ? error.message : String(error)}` }
    }
}
