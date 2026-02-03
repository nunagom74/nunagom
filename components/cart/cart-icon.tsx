'use client'

import { useCart } from '@/lib/store/use-cart'
import { Button } from '@/components/ui/button'
import { ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'

export function CartIcon() {
    const { items, openCart } = useCart()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        // Render a placeholder to avoid layout shift, or just icon without badge
        return (
            <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="w-5 h-5" />
            </Button>
        )
    }

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)

    return (
        <Button variant="ghost" size="icon" className="relative" onClick={openCart}>
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center rounded-full">
                    {itemCount}
                </span>
            )}
        </Button>
    )
}
