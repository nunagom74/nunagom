'use client'

import { useState } from 'react'
import { Order, OrderItem, Product, OrderStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { updateOrderStatus } from '@/app/actions/order-admin'
import { Loader2 } from 'lucide-react'
import { OrderDetailSheet } from '@/components/admin/order-detail-sheet'

type OrderWithItems = Order & {
    items: (OrderItem & { product: Product })[]
}

export function MobileOrderCard({ order, dict }: { order: OrderWithItems, dict: any }) {
    const [isUpdating, setIsUpdating] = useState(false)

    const handleStatusChange = async (value: string) => {
        setIsUpdating(true)
        await updateOrderStatus(order.id, value as OrderStatus)
        setIsUpdating(false)
    }

    return (
        <Card>
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start text-xs text-muted-foreground">
                    <span className="font-mono">{order.id.slice(0, 8)}...</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                    <div className="font-bold text-lg">{order.customerName}</div>
                    <div className="font-bold">
                        {order.totalAmount.toLocaleString()} {dict.product.price_unit}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 py-2">
                <div className="text-sm text-muted-foreground mb-4">
                    {order.customerPhone}
                </div>
                <div className="flex items-center gap-2">
                    <Select defaultValue={order.status} onValueChange={handleStatusChange} disabled={isUpdating}>
                        <SelectTrigger className="w-full h-9">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PENDING">{dict.admin.order_list.status.pending}</SelectItem>
                            <SelectItem value="CONFIRMED">{dict.admin.order_list.status.confirmed}</SelectItem>
                            <SelectItem value="SHIPPED">{dict.admin.order_list.status.shipped}</SelectItem>
                            <SelectItem value="DELIVERED">{dict.admin.order_list.status.delivered}</SelectItem>
                            <SelectItem value="CANCELLED">{dict.admin.order_list.status.cancelled}</SelectItem>
                        </SelectContent>
                    </Select>
                    {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0" />}
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-2">
                <OrderDetailSheet order={order} dict={dict}>
                    <Button variant="outline" className="w-full" size="sm">
                        {dict.admin.order_list.view}
                    </Button>
                </OrderDetailSheet>
            </CardFooter>
        </Card>
    )
}
