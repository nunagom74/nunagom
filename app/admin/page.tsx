import { prisma } from '@/lib/db'
import { getDictionary } from '@/lib/i18n'
import { SummaryCards } from '@/components/admin/summary-cards'
import { DashboardCharts } from '@/components/admin/dashboard-charts'
import { OrderStatusChart } from '@/components/admin/order-status-chart'
import { RecentOrders } from '@/components/admin/recent-orders'
import { TopProducts } from '@/components/admin/top-products'

export default async function AdminDashboardPage() {
    const dict = await getDictionary()

    // 1. Order Status Counts
    const statusCounts = await prisma.order.groupBy({
        by: ['status'],
        _count: {
            status: true
        }
    })
    const statusData = statusCounts.map(item => {
        const statusKey = item.status.toLowerCase()
        const statusLabel = (dict.admin.order_list.status as any)[statusKey] || item.status
        return {
            name: statusLabel,
            value: item._count.status
        }
    })

    // Helper for KST Date
    const getKSTDate = (offsetDays = 0) => {
        const d = new Date()
        d.setHours(d.getHours() + 9) // Add 9 hours for KST (approximation for server UTC)
        d.setDate(d.getDate() - offsetDays)
        return d
    }

    // 2. Revenue Trend (Last 30 Days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const revenueOrders = await prisma.order.findMany({
        where: {
            createdAt: { gte: thirtyDaysAgo },
            status: { not: 'CANCELLED' }
        },
        select: {
            createdAt: true,
            totalAmount: true
        }
    })

    // Fill last 30 days
    const revenueMap = new Map<string, number>()
    const visitMap = new Map<string, number>()
    const dateLabels: string[] = []

    for (let i = 29; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        // Key for grouping: YYYY-MM-DD (local logic)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const dateKey = `${year}-${month}-${day}` // Matches DB DailyVisit format usually

        // Display Label: MM/DD
        const label = `${d.getMonth() + 1}/${d.getDate()}`

        revenueMap.set(dateKey, 0)
        visitMap.set(dateKey, 0)
        dateLabels.push(dateKey) // Keep order
    }

    revenueOrders.forEach(order => {
        const d = new Date(order.createdAt)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const key = `${year}-${month}-${day}`

        // Only sum if it falls within our map generation (it should)
        // Note: mismatch might happen slightly due to timezone if not careful, 
        // strictly speaking comparing YYYY-MM-DD is safest if we assume server time consistency
        if (revenueMap.has(key)) {
            revenueMap.set(key, (revenueMap.get(key) || 0) + order.totalAmount)
        } else {
            // Fallback for timezone edge cases: try matching just MM/DD part if needed, 
            // but YYYY-MM-DD is better. Let's assume standard UTC/Server time for simplicity here.
            // If we want perfection, we'd need consistent TZ handling.
            // Let's stick to the generated keys.
        }
    })

    const revenueData = dateLabels.map(key => {
        const [y, m, d] = key.split('-')
        return {
            name: `${Number(m)}/${Number(d)}`,
            total: revenueMap.get(key) || 0
        }
    })


    // 3. Recent Orders
    const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            customerName: true,
            customerEmail: true,
            totalAmount: true,
            status: true
        }
    })


    // 4. Top Selling Products
    const topItems = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
            quantity: true
        },
        orderBy: {
            _sum: {
                quantity: 'desc'
            }
        },
        take: 5
    })

    const topProductIds = topItems.map(item => item.productId)
    const products = await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, title: true, price: true, images: true }
    })

    const topProducts = topItems.map(item => {
        const product = products.find(p => p.id === item.productId)
        return {
            id: item.productId,
            title: product?.title || 'Unknown Product',
            price: product?.price || 0,
            image: product?.images[0] || null,
            soldCount: item._sum.quantity || 0
        }
    })


    // 5. Summary Counts
    const productCount = await prisma.product.count()
    const orderCount = await prisma.order.count()
    const inquiryCount = await prisma.inquiry.count()

    // Fix: Today's Visit (KST)
    // We need current time in KST. 
    // If server is UTC, adding 9 hours converts to KST.
    const nowKST = new Date(new Date().getTime() + 9 * 60 * 60 * 1000)
    const todayStr = nowKST.toISOString().split('T')[0]

    const todayVisit = await prisma.dailyVisit.findUnique({ where: { date: todayStr } })
    const totalVisitsToday = todayVisit?.count || 0

    // 6. Daily Visits (Last 30 Days)
    const visits = await prisma.dailyVisit.findMany({
        where: { date: { gte: dateLabels[0] } }, // Get from 30 days ago
        orderBy: { date: 'asc' }
    })

    visits.forEach(v => {
        if (visitMap.has(v.date)) {
            visitMap.set(v.date, v.count)
        }
    })

    const visitData = dateLabels.map(key => {
        const [y, m, d] = key.split('-')
        return {
            date: `${Number(m)}-${Number(d)}`,
            count: visitMap.get(key) || 0
        }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">{dict.admin.dashboard}</h1>

            {/* Row 1: Summary Cards */}
            <SummaryCards
                summary={{
                    totalProducts: productCount,
                    totalOrders: orderCount,
                    totalInquiries: inquiryCount,
                    totalVisitsToday
                }}
                dict={dict}
            />

            {/* Row 2: Charts (Revenue & Visits) */}
            <DashboardCharts
                revenueData={revenueData}
                visitData={visitData}
                dict={dict}
            />

            {/* Row 3: Status, Top Products, Recent Orders */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <OrderStatusChart statusData={statusData} dict={dict} />
                <TopProducts products={topProducts} dict={dict} />
                <RecentOrders orders={recentOrders} dict={dict} />
            </div>
        </div>
    )
}
