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
import { Printer, Loader2, Save } from 'lucide-react'
import { EmailDialog } from '@/components/admin/email-dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateOrderStatus } from '@/app/actions/order-admin'

type OrderWithItems = Order & {
    items: (OrderItem & { product: Product })[]
    carrier?: string | null
    trackingNumber?: string | null
}

const CARRIERS = [
    { id: 'kr.epost', name: '우체국택배' },
    { id: 'kr.cjlogistics', name: 'CJ대한통운' },
    { id: 'kr.lotte', name: '롯데택배' },
    { id: 'kr.hanjin', name: '한진택배' },
    { id: 'kr.logen', name: '로젠택배' },
]

function AdminStatusSection({ order, dict }: { order: OrderWithItems, dict: any }) {
    const [status, setStatus] = useState<OrderStatus>(order.status)
    const [carrier, setCarrier] = useState(order.carrier || '')
    const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '')
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async () => {
        setIsSaving(true)

        let finalCarrier = carrier
        if (carrier === 'DIRECT_INPUT') finalCarrier = ''

        // If no carrier, don't save tracking number either? Or allow tracking number without carrier?
        // Usually tracking number needs carrier. 
        // If carrier is empty, let's just clear tracking info effectively. 
        // Or if user just typed tracking number but no carrier, maybe they want to save it. 
        // But user request was: "Empty carrier => No tracking info provided logic".

        const trackingData = status === 'SHIPPED' ? {
            carrier: finalCarrier || undefined, // undefined to avoid saving empty string if that matters, or just empty string
            trackingNumber: (finalCarrier ? trackingNumber : undefined) // Only save tracking number if carrier exists? Or allow standalone?
            // Safer: Save whatever inputs have.
        } : undefined

        // Refined logic:
        // status SHIPPED. 
        // carrier: finalCarrier (could be '', 'kr.epost', 'CustomName')
        // trackingNumber: trackingNumber

        const finalTrackingData = status === 'SHIPPED' ? {
            carrier: finalCarrier || null,
            trackingNumber: trackingNumber || null
        } : undefined

        try {
            const result = await updateOrderStatus(order.id, status, trackingData)
            if (result.success) {
                alert('Status updated successfully')
            } else {
                alert('Failed to update: ' + result.error)
            }
        } catch (e) {
            console.error(e)
            alert('Error updating status')
        }
        setIsSaving(false)
    }

    return (
        <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-3 flex items-center gap-2">
                {dict.admin.order_list.status_shipping_title || "Status & Shipping"}
            </h3>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 items-center">
                    <Label className="text-muted-foreground">{dict.admin.order_list.th_status}</Label>
                    <Select value={status} onValueChange={(v: OrderStatus) => setStatus(v)}>
                        <SelectTrigger className="bg-background">
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
                </div>

                {status === 'SHIPPED' && (
                    <>
                        <div className="grid grid-cols-2 gap-4 items-center">
                            <Label className="text-muted-foreground">{dict.admin.order_list.carrier_label || "Carrier"}</Label>
                            <Select
                                value={
                                    carrier === '' ? '' :
                                        CARRIERS.some(c => c.id === carrier) ? carrier :
                                            'other'
                                }
                                onValueChange={(v) => {
                                    if (v === 'other') setCarrier('DIRECT_INPUT')
                                    else setCarrier(v)
                                }}
                            >
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder={dict.admin.order_list.select_carrier || "Select Carrier"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {CARRIERS.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                    <SelectItem value="other">{dict.admin.order_list.carrier_other || "Direct Input"}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {(!CARRIERS.some(c => c.id === carrier) && carrier !== '') && (
                            <div className="grid grid-cols-2 gap-4 items-center">
                                <Label></Label>
                                <Input
                                    className="bg-background"
                                    placeholder={dict.admin.order_list.carrier_other_placeholder || "Enter Carrier Name"}
                                    value={carrier === 'DIRECT_INPUT' ? '' : carrier}
                                    onChange={e => setCarrier(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 items-center">
                            <Label className="text-muted-foreground">{dict.admin.order_list.tracking_no_label || "Tracking No."}</Label>
                            <Input
                                className="bg-background"
                                placeholder="1234567890"
                                value={trackingNumber}
                                onChange={e => setTrackingNumber(e.target.value)}
                            />
                        </div>
                    </>
                )}

                <div className="flex justify-between pt-2">
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={async () => {
                            if (confirm(dict.admin.order_list.confirm_delete || "Are you sure you want to delete this order? This cannot be undone.")) {
                                const { deleteOrder } = await import('@/app/actions/order-admin');
                                const result = await deleteOrder(order.id);
                                if (result.success) {
                                    alert(dict.admin.order_list.delete_success || "Order deleted");
                                    // Close sheet? We can't easily close controlled sheet from here without prop. 
                                    // But revalidatePath will refresh list. 
                                    // ideally we should close the sheet.
                                    // For now, let's reload or just let revalidate handle it (sheet might stay open with deleted data? or close if list updates).
                                    // A full page reload is safest for now to clear state.
                                    window.location.reload();
                                } else {
                                    alert(result.error);
                                }
                            }
                        }}
                    >
                        {dict.admin.order_list.delete_order || "Delete Order"}
                    </Button>

                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {dict.admin.order_list.save_status || "Save Status"}
                    </Button>
                </div>
            </div>
        </div>
    )
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
                    carrier={order.carrier}
                    trackingNumber={order.trackingNumber}
                />

                <div className="space-y-6 px-6 pb-6" ref={printableRef}>
                    {/* Status Management Section */}
                    <AdminStatusSection order={order} dict={dict} />

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
