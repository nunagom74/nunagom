'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    MessageSquare,
    LogOut,
    Menu
} from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/language-switcher'
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useState } from 'react'

interface AdminSidebarProps {
    dict: any
    locale: string
}

function AdminSidebarContent({ dict, locale, className }: AdminSidebarProps & { className?: string }) {
    const pathname = usePathname()

    const sidebarItems = [
        { href: '/admin', label: dict.admin.dashboard, icon: LayoutDashboard },
        { href: '/admin/products', label: dict.admin.products, icon: Package },
        { href: '/admin/orders', label: dict.admin.orders, icon: ShoppingCart },
        { href: '/admin/inquiries', label: dict.admin.inquiries, icon: MessageSquare },
    ]

    return (
        <div className={cn("flex flex-col h-full bg-background", className)}>
            <div className="flex h-16 items-center px-6 border-b shrink-0">
                <Link href="/admin" className="font-bold text-lg text-primary">
                    Nuna Gom Admin
                </Link>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
            <div className="p-4 border-t space-y-4 shrink-0">
                <div className="flex items-center justify-between px-2">
                    <span className="text-xs text-muted-foreground">Language</span>
                    <LanguageSwitcher currentLocale={locale} />
                </div>
                <form action={logoutAction}>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-red-500">
                        <LogOut className="h-4 w-4" />
                        {dict.admin.logout}
                    </Button>
                </form>
            </div>
        </div>
    )
}

export function AdminSidebar({ dict, locale }: AdminSidebarProps) {
    return (
        <aside className="fixed inset-y-0 left-0 z-20 w-64 border-r hidden md:block">
            <AdminSidebarContent dict={dict} locale={locale} />
        </aside>
    )
}

export function AdminMobileNav({ dict, locale }: AdminSidebarProps) {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden mr-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div onClick={() => setOpen(false)} className="h-full">
                    <AdminSidebarContent dict={dict} locale={locale} />
                </div>
            </SheetContent>
        </Sheet>
    )
}
