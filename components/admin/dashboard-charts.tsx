"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

interface DashboardChartsProps {
    revenueData: { name: string; total: number }[]
    visitData: { date: string; count: number }[]
    dict: any
}

export function DashboardCharts({ revenueData, visitData, dict }: DashboardChartsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Revenue Chart (Main) */}
            <Card>
                <CardHeader>
                    <CardTitle>{dict.admin.dashboard_chart_revenue}</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={revenueData}>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `₩${value.toLocaleString()}`}
                            />
                            <Tooltip
                                formatter={(value: any) => [`₩${Number(value).toLocaleString()}`, dict.admin.dashboard_chart_revenue.split(' (')[0]]}
                                labelStyle={{ color: '#333' }}
                                contentStyle={{ borderRadius: '8px' }}
                            />
                            <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} name={dict.admin.dashboard_chart_revenue.split(' (')[0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Visits Chart (Secondary) */}
            <Card>
                <CardHeader>
                    <CardTitle>{dict.admin.dashboard_chart_views}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={visitData}>
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                labelStyle={{ color: '#333' }}
                                contentStyle={{ borderRadius: '8px' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#8884d8"
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
