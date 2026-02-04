import { Order, OrderItem, Product } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { OrderDetailSheet } from '@/components/admin/order-detail-sheet'

type OrderWithItems = Order & {
    items: (OrderItem & { product: Product })[]
}

export function MobileOrderCard({ order, dict }: { order: OrderWithItems, dict: any }) {

    return (
        <Card>
            <CardHeader className="p-3 pb-1">
                <div className="flex justify-between items-start text-xs text-muted-foreground">
                    <span className="font-mono">{order.id.slice(0, 8)}...</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                    <div className="font-semibold">{order.customerName}</div>
                    <div className="font-semibold">
                        {order.totalAmount.toLocaleString()} {dict.product.price_unit}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-3 py-1">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground text-xs">{order.customerPhone}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                        ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                        'bg-red-100 text-red-800'
                        }`}>
                        {dict.admin.order_list.status[order.status.toLowerCase()]}
                    </span>
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
