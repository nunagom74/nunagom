import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getDictionary } from '@/lib/i18n'
import { ProductList } from '@/components/admin/product-list'

export default async function ProductsPage() {
    const dict = await getDictionary()
    const products = await prisma.product.findMany({
        orderBy: [
            { order: 'asc' },
            { createdAt: 'desc' }
        ],
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{dict.admin.product_list.title}</h1>
                <Button asChild>
                    <Link href="/admin/products/new">
                        <Plus className="mr-2 h-4 w-4" /> {dict.admin.product_list.add_new}
                    </Link>
                </Button>
            </div>

            <ProductList products={products} dict={dict} />
        </div>
    )
}
