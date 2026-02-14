import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Package, ShoppingCart, MessageSquare, TrendingUp } from "lucide-react"

interface SummaryCardsProps {
    summary: {
        totalProducts: number
        totalOrders: number
        totalInquiries: number
        totalVisitsToday: number
    }
    dict: any
}

export function SummaryCards({ summary, dict }: SummaryCardsProps) {
    return (
        <div className="grid grid-cols-4 gap-2 md:gap-4">
            <Card className="py-2 gap-1 md:py-6 md:gap-6">
                <CardHeader className="px-3 pt-2 pb-0.5 md:p-6 md:pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium">{dict.admin.total_products}</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-2 pt-0 md:p-6 md:pt-0">
                    <div className="flex items-center justify-between">
                        <div className="text-xl md:text-2xl font-bold">{summary.totalProducts}</div>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
            <Card className="py-2 gap-1 md:py-6 md:gap-6">
                <CardHeader className="px-3 pt-2 pb-0.5 md:p-6 md:pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium">{dict.admin.orders}</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-2 pt-0 md:p-6 md:pt-0">
                    <div className="flex items-center justify-between">
                        <div className="text-xl md:text-2xl font-bold">{summary.totalOrders}</div>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
            <Card className="py-2 gap-1 md:py-6 md:gap-6">
                <CardHeader className="px-3 pt-2 pb-0.5 md:p-6 md:pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium">{dict.admin.inquiries}</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-2 pt-0 md:p-6 md:pt-0">
                    <div className="flex items-center justify-between">
                        <div className="text-xl md:text-2xl font-bold">{summary.totalInquiries}</div>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
            <Card className="py-2 gap-1 md:py-6 md:gap-6">
                <CardHeader className="px-3 pt-2 pb-0.5 md:p-6 md:pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium">{dict.admin.dashboard_visits_today}</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-2 pt-0 md:p-6 md:pt-0">
                    <div className="flex items-center justify-between">
                        <div className="text-xl md:text-2xl font-bold">{summary.totalVisitsToday}</div>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
