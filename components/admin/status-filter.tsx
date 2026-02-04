'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { OrderStatus } from '@prisma/client'

export function StatusFilter({ dict }: { dict: any }) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const currentStatus = searchParams.get('status')

    const statuses = [
        { value: 'all', label: dict.admin.order_list.status_all || '전체' },
        { value: 'PENDING', label: dict.admin.order_list.status.pending },
        { value: 'CONFIRMED', label: dict.admin.order_list.status.confirmed },
        { value: 'SHIPPED', label: dict.admin.order_list.status.shipped },
        { value: 'DELIVERED', label: dict.admin.order_list.status.delivered },
        { value: 'CANCELLED', label: dict.admin.order_list.status.cancelled },
    ]

    const handleFilter = (status: string) => {
        const params = new URLSearchParams(searchParams)
        if (status === 'all') {
            params.delete('status')
        } else {
            params.set('status', status)
        }
        router.replace(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
                <Button
                    key={status.value}
                    variant={
                        (currentStatus === status.value) || (!currentStatus && status.value === 'all')
                            ? 'default'
                            : 'outline'
                    }
                    size="sm"
                    onClick={() => handleFilter(status.value)}
                    className="h-8"
                >
                    {status.label}
                </Button>
            ))}
        </div>
    )
}
