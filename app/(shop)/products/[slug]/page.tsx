import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from '@/components/ui/separator'
import { getDictionary } from '@/lib/i18n'
import { ProductGallery } from '@/components/product-gallery'
import { AddToCartButton } from '@/components/cart/add-to-cart-button'

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const decodedSlug = decodeURIComponent(slug)
    const dict = await getDictionary()
    const product = await prisma.product.findUnique({
        where: { slug: decodedSlug }
    })

    if (!product) {
        notFound()
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
                {/* Gallery */}
                <ProductGallery
                    images={product.images}
                    title={product.title}
                    soldOut={product.stock === 0 && !product.madeToOrder}
                    madeToOrder={product.madeToOrder}
                    dict={dict}
                />

                {/* Info */}
                <div className="flex flex-col">
                    <div className="mb-6">
                        <h1 className="text-3xl md:text-4xl font-bold font-serif text-primary mb-2">{product.title}</h1>
                        <div className="text-2xl font-medium text-foreground">
                            {product.price.toLocaleString()} {dict.product.price_unit}
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <p className="text-muted-foreground leading-relaxed">
                            {product.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {product.madeToOrder ? (
                                <Badge variant="secondary">{dict.product.made_to_order} (Runs {product.leadTimeDays} days)</Badge>
                            ) : (
                                <Badge variant="outline">{dict.product.in_stock}: {product.stock}</Badge>
                            )}
                            <Badge variant="outline">{dict.product.shipping_fee}: {product.shippingFee.toLocaleString()} {dict.product.price_unit}</Badge>
                        </div>
                    </div>

                    <Separator className="mb-8" />

                    <div className="flex flex-col gap-4 mb-8">
                        <div className="flex gap-4 flex-col sm:flex-row">
                            {product.stock === 0 && !product.madeToOrder ? (
                                <Button size="lg" disabled className="flex-1 rounded-full">{dict.product.sold_out}</Button>
                            ) : (
                                <div className="flex-1 flex gap-2">
                                    <AddToCartButton
                                        product={{
                                            id: product.id,
                                            title: product.title,
                                            price: product.price,
                                            images: product.images,
                                            stock: product.stock,
                                            madeToOrder: product.madeToOrder,
                                            shippingFee: product.shippingFee
                                        }}
                                        label={dict.product.add_to_cart || "Add to Cart"}
                                    />
                                    <Button size="lg" className="flex-1 rounded-full" variant="secondary" asChild>
                                        <Link href={`/order?productId=${product.id}`}>
                                            {product.madeToOrder ? dict.product.request_order : dict.product.buy_now}
                                        </Link>
                                    </Button>
                                </div>
                            )}
                            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full" asChild>
                                <Link href="/inquiry">{dict.product.ask_question}</Link>
                            </Button>
                        </div>
                    </div>

                    <Tabs defaultValue="care" className="w-full">
                        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                            <TabsTrigger value="care" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">{dict.product.care_instructions}</TabsTrigger>
                            <TabsTrigger value="delivery" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">{dict.product.delivery}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="care" className="pt-4 text-sm text-muted-foreground leading-relaxed">
                            <ul className="space-y-1">
                                {(Array.isArray(dict.product.care_text) ? dict.product.care_text : [dict.product.care_text]).map((line: string, i: number) => (
                                    <li key={i}>{line}</li>
                                ))}
                            </ul>
                        </TabsContent>
                        <TabsContent value="delivery" className="pt-4 text-sm text-muted-foreground leading-relaxed">
                            <ul className="space-y-1">
                                {(Array.isArray(dict.product.delivery_text) ? dict.product.delivery_text : [dict.product.delivery_text]).map((line: string, i: number) => (
                                    <li key={i}>{line.replace('{days}', (product.leadTimeDays || 7).toString())}</li>
                                ))}
                            </ul>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
