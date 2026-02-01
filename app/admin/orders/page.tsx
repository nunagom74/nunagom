import { prisma } from '@/lib/db'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { OrderRow } from '@/components/admin/order-row'

export default async function OrdersPage() {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        }
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order: any) => (
                            <OrderRow key={order.id} order={order} />
                        ))}
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No orders yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
