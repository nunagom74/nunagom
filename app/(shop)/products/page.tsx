import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getDictionary } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export default async function ProductListPage() {
    const dict = await getDictionary()
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="container px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-serif text-primary">{dict.home.shop_collection}</h1>
                <p className="text-muted-foreground mt-2">{dict.home.new_arrivals_desc}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <Link key={product.id} href={`/products/${product.slug}`} className="group">
                        <Card className="border-none shadow-none bg-transparent">
                            <div className="aspect-square bg-muted rounded-xl overflow-hidden relative mb-4">
                                {product.images[0] ? (
                                    <img
                                        src={product.images[0]}
                                        alt={product.title}
                                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground/20">
                                        No Image
                                    </div>
                                )}
                                {product.stock === 0 && !product.madeToOrder && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold">
                                        {dict.product.sold_out}
                                    </div>
                                )}
                                {product.madeToOrder && (
                                    <Badge className="absolute top-2 left-2 bg-amber-100 text-amber-800 hover:bg-amber-100 border-none">
                                        {dict.product.made_to_order}
                                    </Badge>
                                )}
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-medium text-lg leading-none group-hover:text-primary/80 transition-colors">
                                    {product.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {product.price.toLocaleString()} {dict.product.price_unit}
                                </p>
                            </div>
                        </Card>
                    </Link>
                ))}
                {products.length === 0 && (
                    <div className="col-span-full text-center py-20 text-muted-foreground">
                        No products found.
                    </div>
                )}
            </div>
        </div>
    )
}
