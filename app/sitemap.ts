import { MetadataRoute } from 'next'
import { prisma } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const products = await prisma.product.findMany({
        select: { slug: true, updatedAt: true },
    })

    const productUrls = products.map((product) => ({
        url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
        lastModified: product.updatedAt,
        priority: 0.8,
    }))

    return [
        {
            url: `${process.env.NEXT_PUBLIC_APP_URL}`,
            lastModified: new Date(),
            priority: 1,
        },
        {
            url: `${process.env.NEXT_PUBLIC_APP_URL}/products`,
            lastModified: new Date(),
            priority: 0.9,
        },
        {
            url: `${process.env.NEXT_PUBLIC_APP_URL}/about`, // Placeholder
            lastModified: new Date(),
            priority: 0.5,
        },
        ...productUrls,
    ]
}
