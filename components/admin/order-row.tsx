'use client'

import { useState } from 'react'
import { Order, OrderItem, Product, OrderStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { OrderDetailSheet } from '@/components/admin/order-detail-sheet'

type OrderWithItems = Order & {
    items: (OrderItem & { product: Product })[]
}

export function OrderRow({ order, dict }: { order: OrderWithItems, dict: any }) {
    // Status update logic removed to keep list view read-only.
    // Edit status inside the details sheet.

    return (
        <TableRow>
            <TableCell className="font-mono text-xs hidden md:table-cell">{order.id.slice(0, 8)}...</TableCell>
            <TableCell>
                <div className="font-medium">{order.customerName}</div>
                <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                        'bg-red-100 text-red-800'
                        }`}>
                        {dict.admin.order_list.status[order.status.toLowerCase()]}
                    </span>
                </div>
            </TableCell>
            <TableCell>{order.totalAmount.toLocaleString()} {dict.product.price_unit}</TableCell>
            <TableCell className="hidden md:table-cell">
                {new Date(order.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
            </TableCell>
            <TableCell>
                <OrderDetailSheet order={order} dict={dict}>
                    <Button variant="outline" size="sm">{dict.admin.order_list.view}</Button>
                </OrderDetailSheet>
            </TableCell>
        </TableRow>
    )
}
