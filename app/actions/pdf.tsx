'use server'

import { prisma } from '@/lib/db'
import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/pdf/invoice-pdf'
import React from 'react'

import { getDictionary } from '@/lib/i18n'
import { optimizeOrderImages } from '@/lib/pdf-image-helper'


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

        // ...

        // Optimize images for PDF (Thumbnail size)
        const optimizedOrder = await optimizeOrderImages(order as any);

        // Generate PDF on server with dict
        const pdfBuffer = await renderToBuffer(<InvoicePDF order={optimizedOrder} dict={dict} />)
        const base64 = pdfBuffer.toString('base64')

        return { success: true, data: base64 }

    } catch (error) {
        console.error('Failed to generate PDF:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}
