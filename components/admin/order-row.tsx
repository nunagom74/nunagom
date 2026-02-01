'use client'

import { useState } from 'react'
import { Order, OrderItem, Product, OrderStatus } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { TableCell, TableRow } from '@/components/ui/table'
import { updateOrderStatus } from '@/app/actions/order-admin'
import { Loader2 } from 'lucide-react'

type OrderWithItems = Order & {
    items: (OrderItem & { product: Product })[]
}

export function OrderRow({ order }: { order: OrderWithItems }) {
    const [isUpdating, setIsUpdating] = useState(false)

    const handleStatusChange = async (value: string) => {
        setIsUpdating(true)
        await updateOrderStatus(order.id, value as OrderStatus)
        setIsUpdating(false)
    }

    return (
        <TableRow>
            <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
            <TableCell>
                <div className="font-medium">{order.customerName}</div>
                <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Select defaultValue={order.status} onValueChange={handleStatusChange} disabled={isUpdating}>
                        <SelectTrigger className="w-[140px] h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="SHIPPED">Shipped</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                    {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                </div>
            </TableCell>
            <TableCell>{order.totalAmount.toLocaleString()} KRW</TableCell>
            <TableCell className="text-muted-foreground text-sm">
                {new Date(order.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm">View</Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto">
                        <SheetHeader className="mb-6">
                            <SheetTitle>Order Details</SheetTitle>
                            <SheetDescription>
                                Order ID: {order.id}<br />
                                Date: {new Date(order.createdAt).toLocaleString()}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-medium mb-2">Customer Info</h3>
                                <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-1">
                                    <p><span className="font-semibold">Name:</span> {order.customerName}</p>
                                    <p><span className="font-semibold">Phone:</span> {order.customerPhone}</p>
                                    <p><span className="font-semibold">Email:</span> {order.customerEmail || '-'}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">Shipping Address</h3>
                                <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-1">
                                    <p>{order.address}</p>
                                    <p>{order.detailAddress}</p>
                                </div>
                            </div>

                            {order.message && (
                                <div>
                                    <h3 className="font-medium mb-2">Message</h3>
                                    <div className="bg-muted/50 p-4 rounded-lg text-sm italic">
                                        "{order.message}"
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="font-medium mb-2">Items</h3>
                                <div className="space-y-3">
                                    {order.items.map(item => (
                                        <div key={item.id} className="flex gap-4 border rounded-lg p-3">
                                            <div className="h-16 w-16 bg-secondary rounded-md overflow-hidden flex-shrink-0">
                                                {item.product.images[0] && (
                                                    <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">{item.product.title}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {item.quantity} x {item.price.toLocaleString()} KRW
                                                </div>
                                                {item.options && (typeof item.options === 'object') && (
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>{order.totalAmount.toLocaleString()} KRW</span>
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </TableCell>
        </TableRow>
    )
}
