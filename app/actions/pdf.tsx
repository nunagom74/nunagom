'use server'

import { prisma } from '@/lib/db'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/pdf/invoice-pdf'
import React from 'react'

import { getDictionary } from '@/lib/i18n'

export async function generateInvoicePDF(orderId: string, locale: string = 'ko') {
    try {
        // Load Dictionary
        const dict = await getDictionary(locale as any)

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: { include: { product: true } } }
        })

        if (!order) {
            return { success: false, error: 'Order not found' }
        }

        // Generate PDF on server with dict
        const pdfBuffer = await renderToBuffer(<InvoicePDF order={order} dict={dict} />)
        const base64 = pdfBuffer.toString('base64')

        return { success: true, data: base64 }

    } catch (error) {
        console.error('Failed to generate PDF:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}
