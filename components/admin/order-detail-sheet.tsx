'use client'

import { useRef, useState } from 'react'
import { Order, OrderItem, Product, OrderStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Printer } from 'lucide-react'
import { EmailDialog } from '@/components/admin/email-dialog'

type OrderWithItems = Order & {
    items: (OrderItem & { product: Product })[]
}

interface OrderDetailSheetProps {
    order: OrderWithItems
    dict: any
    children: React.ReactNode
}

export function OrderDetailSheet({ order, dict, children }: OrderDetailSheetProps) {
    const [emailDialogOpen, setEmailDialogOpen] = useState(false)
    const printableRef = useRef<HTMLDivElement>(null)

    const handlePrint = () => {
        const content = printableRef.current
        if (!content) return

        // Calculate totals
        const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
        const shippingFee = order.totalAmount - subtotal

        const printWindow = window.open('', '', 'width=800,height=800')
        if (!printWindow) return

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Invoice #${order.id}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
                        body { 
                            font-family: 'Noto Sans KR', sans-serif; 
                            padding: 40px; 
                            color: #333;
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        .header { 
                            display: flex; 
                            justify-content: space-between; 
                            align-items: flex-start;
                            border-bottom: 2px solid #333; 
                            padding-bottom: 20px;
                            margin-bottom: 30px;
                        }
                        .brand { font-size: 24px; font-weight: bold; }
                        .brand small { font-size: 14px; font-weight: normal; display: block; margin-top: 5px; color: #666; }
                        .invoice-title { font-size: 32px; font-weight: bold; color: #333; text-align: right; }
                        
                        .grid-row { display: flex; gap: 40px; margin-bottom: 40px; }
                        .col { flex: 1; }
                        
                        h3 { font-size: 14px; text-transform: uppercase; color: #666; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; }
                        p { margin: 5px 0; font-size: 14px; line-height: 1.5; }
                        .label { font-weight: bold; width: 80px; display: inline-block; }
                        
                        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th { background: #f8f9fa; text-align: left; padding: 12px; font-size: 13px; text-transform: uppercase; border-bottom: 2px solid #ddd; }
                        td { padding: 15px 12px; border-bottom: 1px solid #eee; vertical-align: middle; font-size: 14px; }
                        .text-right { text-align: right; }
                        .thumb { width: 50px; height: 50px; object-fit: cover; border-radius: 4px; background: #eee; }
                        
                        .totals { width: 300px; margin-left: auto; }
                        .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
                        .grand-total { border-top: 2px solid #333; padding-top: 15px; margin-top: 10px; font-weight: bold; font-size: 18px; }
                        
                        .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="brand">
                            Nuna Gom (누나곰)
                            <small>Handmade Knitted Bears</small>
                        </div>
                        <div>
                            <div class="invoice-title">거 래 명 세 서</div>
                            <p style="text-align: right; margin-top: 10px;">
                                <strong>주문번호:</strong> ${order.id}<br>
                                <strong>일자:</strong> ${new Date(order.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    
                    <div class="grid-row">
                        <div class="col">
                            <h3>${dict.admin.order_list.cust_info}</h3>
                            <p><strong>${order.customerName}</strong></p>
                            <p>${order.customerPhone}</p>
                            <p>${order.customerEmail || ''}</p>
                        </div>
                        <div class="col">
                            <h3>${dict.admin.order_list.ship_addr}</h3>
                            <p>${order.address}</p>
                            <p>${order.detailAddress || ''}</p>
                        </div>
                    </div>

                    ${order.message ? `
                    <div style="margin-bottom: 30px; background: #f9f9f9; padding: 15px; border-radius: 4px;">
                        <h3 style="margin-top: 0;">${dict.admin.order_list.message}</h3>
                        <p style="font-style: italic;">"${order.message}"</p>
                    </div>
                    ` : ''}

                    <table>
                        <thead>
                            <tr>
                                <th style="width: 70px;">이미지</th>
                                <th>상품명</th>
                                <th class="text-right">단가</th>
                                <th class="text-right">수량</th>
                                <th class="text-right">금액</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>
                                        ${item.product.images[0] ?
                `<img src="${item.product.images[0]}" class="thumb" />` :
                '<div class="thumb"></div>'
            }
                                    </td>
                                    <td>
                                        <div style="font-weight: bold;">${item.product.title}</div>
                                        ${item.options && typeof item.options === 'object' ?
                `<div style="font-size: 12px; color: #666; margin-top: 4px;">
                                                ${Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                            </div>` : ''
            }
                                    </td>
                                    <td class="text-right">${item.price.toLocaleString()}</td>
                                    <td class="text-right">${item.quantity}</td>
                                    <td class="text-right">${(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="totals">
                        <div class="total-row">
                            <span>주문금액</span>
                            <span>${subtotal.toLocaleString()} ${dict.product.price_unit}</span>
                        </div>
                        <div class="total-row">
                            <span>배송비</span>
                            <span>${shippingFee.toLocaleString()} ${dict.product.price_unit}</span>
                        </div>
                        <div class="total-row grand-total">
                            <span>합계</span>
                            <span>${order.totalAmount.toLocaleString()} ${dict.product.price_unit}</span>
                        </div>
                    </div>

                    <div class="footer">
                        이용해 주셔서 감사합니다!<br>
                        Nuna Gom - Handcrafted with Love
                    </div>
                </body>
            </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 250)
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
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
                    {/* Content for internal view */}
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
    )
}
