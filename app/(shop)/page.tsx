import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { getDictionary } from '@/lib/i18n'

export default async function HomePage() {
  const dict = await getDictionary()
  const products = await prisma.product.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center bg-[#FDFBF7] text-center px-4 overflow-hidden">
        {/* Decorative Circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-100/30 rounded-full blur-3xl -z-10" />

        <div className="space-y-6 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary font-serif">
            {dict.home.hero_title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {dict.home.hero_desc}
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link href="/products">{dict.home.shop_collection}</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
              <Link href="/inquiry">{dict.home.custom_order}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold font-serif text-primary">{dict.home.new_arrivals}</h2>
          <p className="text-muted-foreground mt-2">{dict.home.new_arrivals_desc}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {products.map(product => (
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
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" className="rounded-full" asChild>
            <Link href="/products">{dict.home.view_all}</Link>
          </Button>
        </div>
      </section>

      {/* Banner */}
      <section className="bg-primary/5 py-16 text-center">
        <div className="container px-4">
          <h3 className="text-xl font-bold mb-4">{dict.home.made_to_order_title}</h3>
          <p className="max-w-xl mx-auto text-muted-foreground mb-6">
            {dict.home.made_to_order_desc}
          </p>
          <Link href="/policy/shipping" className="text-primary underline underline-offset-4 text-sm font-medium">
            {dict.home.read_policy}
          </Link>
        </div>
      </section>
    </div>
  )
}
