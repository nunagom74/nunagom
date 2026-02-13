'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { OrderStatus } from '@prisma/client'
import { getSession } from '@/lib/auth'

export async function updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    trackingData?: { carrier?: string, trackingNumber?: string }
) {
    const session = await getSession()
    if (!session?.user) {
        return { error: 'Unauthorized' }
    }

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
    const session = await getSession()
    if (!session?.user) {
        return { error: 'Unauthorized' }
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Delete all order items first to satisfy foreign key constraints
            await tx.orderItem.deleteMany({
                where: { orderId }
            })

            // Then delete the order
            await tx.order.delete({
                where: { id: orderId }
            })
        })

        revalidatePath('/admin/orders')
        return { success: true }
    } catch (error) {
        console.error('Failed to delete order:', error)
        return { error: `Failed to delete order: ${error instanceof Error ? error.message : String(error)}` }
    }
}
