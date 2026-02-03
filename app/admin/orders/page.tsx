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
import { MobileOrderCard } from '@/components/admin/mobile-order-card'
import { getDictionary } from '@/lib/i18n'

import { SearchInput } from '@/components/admin/search-input'

export default async function OrdersPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { q } = await searchParams
    const search = typeof q === 'string' ? q : undefined

    const dict = await getDictionary()
    const orders = await prisma.order.findMany({
        where: search ? {
            OR: [
                { customerName: { contains: search, mode: 'insensitive' } },
                { id: { contains: search, mode: 'insensitive' } },
            ]
        } : undefined,
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">{dict.admin.order_list.title}</h1>
                <SearchInput placeholder={dict.admin.order_list.search_placeholder || "검색..."} />
            </div>

            <div className="hidden md:block rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="hidden md:table-cell">{dict.admin.order_list.th_id}</TableHead>
                            <TableHead>{dict.admin.order_list.th_customer}</TableHead>
                            <TableHead>{dict.admin.order_list.th_status}</TableHead>
                            <TableHead>{dict.admin.order_list.th_total}</TableHead>
                            <TableHead className="hidden md:table-cell">{dict.admin.order_list.th_date}</TableHead>
                            <TableHead className="w-[100px]">{dict.admin.order_list.th_actions}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order: any) => (
                            <OrderRow key={order.id} order={order} dict={dict} />
                        ))}
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    {dict.admin.order_list.empty}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="md:hidden space-y-4">
                {orders.map((order: any) => (
                    <MobileOrderCard key={order.id} order={order} dict={dict} />
                ))}
                {orders.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border">
                        {dict.admin.order_list.empty}
                    </div>
                )}
            </div>
        </div>
    )
}
