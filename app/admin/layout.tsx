'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    MessageSquare,
    LogOut
} from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

const sidebarItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <div className="flex min-h-screen bg-muted/20">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 z-20 w-64 border-r bg-background flex flex-col">
                <div className="flex h-16 items-center border-b px-6">
                    <Link href="/admin" className="font-bold text-lg text-primary">
                        Nuna Gom Admin
                    </Link>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
                                    isActive ? "bg-muted text-foreground" : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
                <div className="p-4 border-t">
                    <Link href="/admin/orders" className={cn("flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:text-primary", pathname === "/admin/orders" ? "bg-muted text-primary" : "text-muted-foreground")}>
                        <ShoppingCart className="h-4 w-4" />
                        Orders
                    </Link>
                    <Link href="/admin/inquiries" className={cn("flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:text-primary", pathname === "/admin/inquiries" ? "bg-muted text-primary" : "text-muted-foreground")}>
                        <MessageSquare className="h-4 w-4" />
                        Inquiries
                    </Link>
                    <form action={logoutAction}>
                        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-red-500">
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8">
                {children}
            </main>
        </div>
    )
}
