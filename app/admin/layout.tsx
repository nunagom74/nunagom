import { getDictionary, getLocale } from '@/lib/i18n'
import { AdminSidebar, AdminMobileNav } from '@/components/admin/admin-sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const dict = await getDictionary()
    const locale = await getLocale()

    return (
        <div className="flex min-h-screen bg-muted/20">
            {/* Desktop Sidebar */}
            <AdminSidebar dict={dict} locale={locale} />

            <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 md:ml-64">
                {/* Mobile Header */}
                <header className="md:hidden flex h-16 items-center border-b bg-background px-4 shrink-0">
                    <AdminMobileNav dict={dict} locale={locale} />
                    <div className="font-bold text-lg">Nuna Gom Admin</div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}
