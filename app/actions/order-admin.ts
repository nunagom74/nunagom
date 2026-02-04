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

export async function deleteOrder(orderId: string) {
    try {
        // Delete items first? Prisma handles cascade delete if configured usually.
        // But to be safe or if not configured:
        // await prisma.orderItem.deleteMany({ where: { orderId } }) 
        // Assuming database has CASCADE ON DELETE constraints or Prisma schema handles it.
        // Let's try simple delete first.

        await prisma.order.delete({
            where: { id: orderId }
        })
        revalidatePath('/admin/orders')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete order:', error)
        return { error: `Failed to delete order: ${error instanceof Error ? error.message : String(error)}` }
    }
}
