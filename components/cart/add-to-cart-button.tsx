'use client'

import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/store/use-cart'

interface AddToCartButtonProps {
    product: {
        id: string
        title: string
        price: number
        images: string[]
        stock: number | null
        madeToOrder: boolean
        shippingFee: number
    }
    label: string
}

export function AddToCartButton({ product, label }: AddToCartButtonProps) {
    const { addItem } = useCart()

    const handleAddToCart = () => {
        addItem({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.images[0] || '/placeholder.png',
            quantity: 1,
            maxStock: product.stock || undefined,
            shippingFee: product.shippingFee
        })
    }

    return (
        <Button size="lg" className="flex-1 rounded-full" onClick={handleAddToCart}>
            {label}
        </Button>
    )
}
