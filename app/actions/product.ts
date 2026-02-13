'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getSession } from '@/lib/auth'

const ProductSchema = z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
    price: z.coerce.number().min(0),
    description: z.string(),
    stock: z.coerce.number().optional(),
    leadTimeDays: z.coerce.number().optional(),
    madeToOrder: z.coerce.boolean(),
    // For simplicity MVP, handling images/colors/sizes as comma separated strings or JSON later
    // We'll stick to simple inputs first
})

export async function createProduct(formData: FormData) {
    const session = await getSession()
    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const priceStr = formData.get('price') as string
    const price = Number(priceStr.replace(/,/g, ''))
    const description = formData.get('description') as string
    const madeToOrder = formData.get('madeToOrder') === 'on'
    const stock = formData.get('stock') ? Number(formData.get('stock')) : null
    const leadTimeDays = formData.get('leadTimeDays') ? Number(formData.get('leadTimeDays')) : null

    // Images handling
    const imagesStr = formData.get('images') as string
    const images = imagesStr
        ? imagesStr.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : []

    await prisma.product.create({
        data: {
            title,
            slug,
            price,
            description,
            madeToOrder,
            stock,
            leadTimeDays,
            images,
            colors: [],
            sizes: [],
        }
    })

    revalidatePath('/admin/products')
    redirect('/admin/products')
}

// ... (deleteProduct matches)

export async function updateProduct(id: string, formData: FormData) {
    const session = await getSession()
    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    const title = formData.get('title') as string
    const slug = formData.get('slug') as string
    const priceStr = formData.get('price') as string
    const price = Number(priceStr.replace(/,/g, ''))
    const description = formData.get('description') as string
    const madeToOrder = formData.get('madeToOrder') === 'on'
    const stock = formData.get('stock') ? Number(formData.get('stock')) : null
    const leadTimeDays = formData.get('leadTimeDays') ? Number(formData.get('leadTimeDays')) : null

    const imagesStr = formData.get('images') as string
    const images = imagesStr
        ? imagesStr.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : []

    await prisma.product.update({
        where: { id },
        data: {
            title,
            slug,
            price,
            description,
            madeToOrder,
            stock,
            leadTimeDays,
            images,
        }
    })

    revalidatePath('/admin/products')
    redirect('/admin/products')
}

export async function deleteProduct(id: string) {
    const session = await getSession()
    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    await prisma.product.delete({ where: { id } })
    revalidatePath('/admin/products')
}

export async function reorderProducts(items: { id: string; order: number }[]) {
    const session = await getSession()
    if (!session?.user) {
        throw new Error('Unauthorized')
    }

    await prisma.$transaction(
        items.map((item) =>
            prisma.product.update({
                where: { id: item.id },
                data: { order: item.order },
            })
        )
    )
    revalidatePath('/admin/products')
    revalidatePath('/') // Also revalidate home/shop where products might be shown
}
