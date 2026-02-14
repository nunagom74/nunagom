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
                <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pt-2 pb-0.5 md:p-6 md:pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium truncate">{dict.admin.total_products}</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
                </CardHeader>
                <CardContent className="px-3 pb-2 pt-0 md:p-6 md:pt-0">
                    <div className="text-xl md:text-2xl font-bold">{summary.totalProducts}</div>
                </CardContent>
            </Card>
            <Card className="py-2 gap-1 md:py-6 md:gap-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pt-2 pb-0.5 md:p-6 md:pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium truncate">{dict.admin.orders}</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
                </CardHeader>
                <CardContent className="px-3 pb-2 pt-0 md:p-6 md:pt-0">
                    <div className="text-xl md:text-2xl font-bold">{summary.totalOrders}</div>
                </CardContent>
            </Card>
            <Card className="py-2 gap-1 md:py-6 md:gap-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pt-2 pb-0.5 md:p-6 md:pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium truncate">{dict.admin.inquiries}</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
                </CardHeader>
                <CardContent className="px-3 pb-2 pt-0 md:p-6 md:pt-0">
                    <div className="text-xl md:text-2xl font-bold">{summary.totalInquiries}</div>
                </CardContent>
            </Card>
            <Card className="py-2 gap-1 md:py-6 md:gap-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pt-2 pb-0.5 md:p-6 md:pb-2">
                    <CardTitle className="text-xs md:text-sm font-medium truncate">{dict.admin.dashboard_visits_today}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
                </CardHeader>
                <CardContent className="px-3 pb-2 pt-0 md:p-6 md:pt-0">
                    <div className="text-xl md:text-2xl font-bold">{summary.totalVisitsToday}</div>
                </CardContent>
            </Card>
        </div>
    )
}
