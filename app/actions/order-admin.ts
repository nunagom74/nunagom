'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { OrderStatus } from '@prisma/client'

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
    try {
        await prisma.order.update({
            where: { id: orderId },
            data: { status }
        })
        revalidatePath('/admin/orders')
        return { success: true }
    } catch (error) {
        console.error('Failed to update order status:', error)
        return { error: 'Failed to update status' }
    }
}
