import { prisma } from '@/lib/db'
import { ProductForm } from '@/components/admin/product-form'
import { notFound } from 'next/navigation'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const product = await prisma.product.findUnique({
        where: { id }
    })

    if (!product) {
        notFound()
    }

    return <ProductForm product={product} />
}
