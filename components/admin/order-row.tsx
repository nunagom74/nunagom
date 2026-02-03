'use client'

import { useState, useRef } from 'react'
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
import { Loader2, Printer } from 'lucide-react'
import { EmailDialog } from '@/components/admin/email-dialog'

type OrderWithItems = Order & {
    items: (OrderItem & { product: Product })[]
}

export function OrderRow({ order, dict }: { order: OrderWithItems, dict: any }) {
    const [isUpdating, setIsUpdating] = useState(false)
    const [emailDialogOpen, setEmailDialogOpen] = useState(false)
    const printableRef = useRef<HTMLDivElement>(null)

    const handleStatusChange = async (value: string) => {
        setIsUpdating(true)
        await updateOrderStatus(order.id, value as OrderStatus)
        setIsUpdating(false)
    }

    const handlePrint = () => {
        const content = printableRef.current
        if (!content) return

        const printWindow = window.open('', '', 'width=800,height=600')
        if (!printWindow) return

        printWindow.document.write(`
            <html>
                <head>
                    <title>Order #${order.id}</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
                        .section { margin-bottom: 20px; }
                        .label { font-weight: bold; width: 120px; display: inline-block; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f4f4f4; }
                        .total { text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <h1>${dict.admin.order_list.details_title}</h1>
                    <div class="section">
                        <p><span class="label">${dict.admin.order_list.th_id}:</span> ${order.id}</p>
                        <p><span class="label">${dict.admin.order_list.th_date}:</span> ${new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    
                    <div class="section">
                        <h3>${dict.admin.order_list.cust_info}</h3>
                        <p><span class="label">${dict.order.name}:</span> ${order.customerName}</p>
                        <p><span class="label">${dict.order.phone}:</span> ${order.customerPhone}</p>
                        <p><span class="label">Email:</span> ${order.customerEmail || '-'}</p>
                    </div>

                    <div class="section">
                        <h3>${dict.admin.order_list.ship_addr}</h3>
                        <p>${order.address} ${order.detailAddress || ''}</p>
                    </div>

                    ${order.message ? `
                    <div class="section">
                        <h3>${dict.admin.order_list.message}</h3>
                        <p>${order.message}</p>
                    </div>
                    ` : ''}

                    <table>
                        <thead>
                            <tr>
                                <th>${dict.admin.product_list.th_name}</th>
                                <th>${dict.order.quantity}</th>
                                <th>${dict.admin.product_list.th_price}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>
                                        ${item.product.title}
                                        ${item.options && typeof item.options === 'object' ?
                `<br><small>${Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(', ')}</small>`
                : ''}
                                    </td>
                                    <td>${item.quantity}</td>
                                    <td>${item.price.toLocaleString()} ${dict.product.price_unit}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="total">
                        ${dict.admin.order_list.total}: ${order.totalAmount.toLocaleString()} ${dict.product.price_unit}
                    </div>
                </body>
            </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        printWindow.close()
    }

    return (
        <TableRow>
            <TableCell className="font-mono text-xs hidden md:table-cell">{order.id.slice(0, 8)}...</TableCell>
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
                            <SelectItem value="PENDING">{dict.admin.order_list.status.pending}</SelectItem>
                            <SelectItem value="CONFIRMED">{dict.admin.order_list.status.confirmed}</SelectItem>
                            <SelectItem value="SHIPPED">{dict.admin.order_list.status.shipped}</SelectItem>
                            <SelectItem value="DELIVERED">{dict.admin.order_list.status.delivered}</SelectItem>
                            <SelectItem value="CANCELLED">{dict.admin.order_list.status.cancelled}</SelectItem>
                        </SelectContent>
                    </Select>
                    {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                </div>
            </TableCell>
            <TableCell>{order.totalAmount.toLocaleString()} {dict.product.price_unit}</TableCell>
            <TableCell className="text-muted-foreground text-sm hidden md:table-cell">
                {new Date(order.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm">{dict.admin.order_list.view}</Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                        <SheetHeader className="mb-6 px-6">
                            <SheetTitle>{dict.admin.order_list.details_title}</SheetTitle>
                            <SheetDescription>
                                {dict.admin.order_list.th_id}: {order.id}<br />
                                {dict.admin.order_list.th_date}: {new Date(order.createdAt).toLocaleString()}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="px-6 flex flex-wrap gap-2 mb-4">
                            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                                <Printer className="h-4 w-4" />
                                {dict.admin.order_list.print}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEmailDialogOpen(true)}>
                                {dict.admin.order_list.send_email}
                            </Button>
                        </div>

                        <EmailDialog
                            open={emailDialogOpen}
                            onOpenChange={setEmailDialogOpen}
                            orderId={order.id}
                            orderStatus={order.status}
                            customerName={order.customerName}
                            customerEmail={order.customerEmail || undefined}
                            dict={dict}
                        />

                        <div className="space-y-6 px-6 pb-6" ref={printableRef}>
                            {/* Content for internal view (same as before) */}
                            <div>
                                <h3 className="font-medium mb-2">{dict.admin.order_list.cust_info}</h3>
                                <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-1">
                                    <p><span className="font-semibold">{dict.order.name}:</span> {order.customerName}</p>
                                    <p><span className="font-semibold">{dict.order.phone}:</span> {order.customerPhone}</p>
                                    <p><span className="font-semibold">Email:</span> {order.customerEmail || '-'}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">{dict.admin.order_list.ship_addr}</h3>
                                <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-1">
                                    <p>{order.address}</p>
                                    <p>{order.detailAddress}</p>
                                </div>
                            </div>

                            {order.message && (
                                <div>
                                    <h3 className="font-medium mb-2">{dict.admin.order_list.message}</h3>
                                    <div className="bg-muted/50 p-4 rounded-lg text-sm italic">
                                        "{order.message}"
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="font-medium mb-2">{dict.admin.order_list.items}</h3>
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
                                                    {item.quantity} x {item.price.toLocaleString()} {dict.product.price_unit}
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
                                    <span>{dict.admin.order_list.total}</span>
                                    <span>{order.totalAmount.toLocaleString()} {dict.product.price_unit}</span>
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </TableCell>
        </TableRow>
    )
}
