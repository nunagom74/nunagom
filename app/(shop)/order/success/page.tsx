import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import { getDictionary } from '@/lib/i18n'

import { CartClearer } from '@/components/cart/cart-clearer'

export default async function OrderSuccessPage() {
    const dict = await getDictionary()

    return (
        <div className="container px-4 py-20 flex flex-col items-center text-center space-y-6">
            <CartClearer />
            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold font-serif text-primary">{dict.success.order_title}</h1>
            <p className="max-w-md text-muted-foreground">
                {dict.success.order_desc}
            </p>
            <div className="pt-4">
                <Button asChild>
                    <Link href="/">{dict.success.back_home}</Link>
                </Button>
            </div>
        </div>
    )
}
