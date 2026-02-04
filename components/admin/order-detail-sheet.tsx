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

    const handlePrint = async () => {
        try {
            // Call Server Action
            const { generateInvoicePDF } = await import('@/app/actions/pdf');

            const result = await generateInvoicePDF(order.id);

            if (!result.success || !result.data) {
                throw new Error(result.error || 'Failed to generate PDF');
            }

            // Convert Base64 to Blob
            const byteCharacters = atob(result.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });

            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error('Failed to generate PDF:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`PDF 생성 실패: ${errorMessage}\n\n관리자에게 문의하세요.`);
        }
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
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">{dict.order?.subtotal || "주문 금액"}</span>
                            <span>{order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString()} {dict.product.price_unit}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-4">
                            <span className="text-muted-foreground">{dict.order?.shipping_fee || "배송비"}</span>
                            <span>{(order.totalAmount - order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)).toLocaleString()} {dict.product.price_unit}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>{dict.admin.order_list.total}</span>
                            <span>{order.totalAmount.toLocaleString()} {dict.product.price_unit}</span>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
