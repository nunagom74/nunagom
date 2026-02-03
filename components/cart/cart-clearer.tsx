'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useCart } from '@/lib/store/use-cart'

export function CartClearer() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { clearCart } = useCart()

    useEffect(() => {
        if (searchParams.get('clearCart') === 'true') {
            clearCart()
            // Remove the query param to check only once
            router.replace('/order/success')
        }
    }, [searchParams, clearCart, router])

    return null
}
