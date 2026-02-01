import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/db'

export default async function AdminDashboardPage() {
    const productCount = await prisma.product.count()
    const orderCount = await prisma.order.count()
    const inquiryCount = await prisma.inquiry.count()

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{productCount}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orderCount}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inquiryCount}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
