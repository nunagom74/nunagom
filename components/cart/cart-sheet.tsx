'use client'

import { useCart } from '@/lib/store/use-cart'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function CartSheet({ dict }: { dict?: any }) {
    const { items, isOpen, closeCart, updateQuantity, removeItem } = useCart()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    const handleUpdateQuantity = (id: string, currentQty: number, change: number, maxStock?: number) => {
        const newQty = currentQty + change
        if (newQty < 1) return

        if (change > 0 && maxStock !== undefined && newQty > maxStock) {
            toast.error(dict?.cart?.stock_limit_reached || "Stock limit reached")
            return
        }
        updateQuantity(id, newQty)
    }

    const t = {
        title: dict?.cart?.title || "Shopping Cart",
        empty_title: dict?.cart?.empty_title || "Your cart is empty",
        continue: dict?.cart?.continue || "Continue Shopping",
        total: dict?.cart?.total || "Total",
        shipping_note: dict?.cart?.shipping_note || "Shipping fees calculated at checkout",
        checkout: dict?.cart?.checkout || "Proceed to Checkout",
        unit: dict?.product?.price_unit || "KRW"
    }

    return (
        <Sheet open={isOpen} onOpenChange={closeCart}>
            {/* Improved Padding: Add padding to sheet content */}
            <SheetContent className="w-full sm:w-[540px] flex flex-col p-6 sm:max-w-md md:max-w-lg">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 text-xl font-bold">
                        <ShoppingBag className="w-6 h-6" />
                        {t.title} ({items.length})
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 flex flex-col overflow-hidden mt-8">
                    {items.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-4">
                            <ShoppingBag className="w-16 h-16 opacity-20" />
                            <p className="text-lg font-medium">{t.empty_title}</p>
                            <Button variant="outline" onClick={closeCart}>
                                {t.continue}
                            </Button>
                        </div>
                    ) : (
                        <>
                            <ScrollArea className="flex-1 -mx-6 px-6">
                                <div className="space-y-6 pb-6">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4">
                                            <div className="relative w-24 h-24 bg-secondary rounded-lg overflow-hidden flex-shrink-0 border">
                                                <Image
                                                    src={item.image}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <h4 className="font-medium text-base line-clamp-2 leading-tight">{item.title}</h4>
                                                    <p className="text-sm text-muted-foreground mt-1 font-medium">
                                                        {item.price.toLocaleString()} {t.unit}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center border rounded-md shadow-sm bg-background">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-muted"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </Button>
                                                        <span className="text-sm w-8 text-center font-medium tabular-nums">{item.quantity}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-muted"
                                                            onClick={() => handleUpdateQuantity(item.id, item.quantity, 1, item.maxStock)}
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                                                        onClick={() => removeItem(item.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>

                            <div className="pt-6 mt-auto border-t bg-background z-10">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-xl font-bold">
                                        <span>{t.total}</span>
                                        <span>{totalAmount.toLocaleString()} {t.unit}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center">
                                        {t.shipping_note}
                                    </p>
                                    <Button className="w-full h-12 text-lg font-bold" size="lg" asChild onClick={closeCart}>
                                        <Link href="/order">
                                            {t.checkout}
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
