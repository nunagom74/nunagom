import Link from 'next/link'
import { ShoppingBag, Menu, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getDictionary, getLocale } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/language-switcher'
import { CartSheet } from '@/components/cart/cart-sheet'
import { CartIcon } from '@/components/cart/cart-icon'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
    const dict = await getDictionary()
    const locale = await getLocale()

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="font-serif text-xl font-bold tracking-tight text-primary">
                            Nuna Gom
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                        <Link href="/products" className="hover:text-foreground transition-colors">{dict.nav.shop}</Link>
                        <Link href="/about" className="hover:text-foreground transition-colors">{dict.nav.about}</Link>
                        <Link href="/inquiry" className="hover:text-foreground transition-colors">{dict.nav.contact}</Link>
                    </nav>

                    <div className="flex items-center gap-2">
                        <LanguageSwitcher currentLocale={locale} />
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="https://instagram.com" target="_blank">
                                <Instagram className="h-5 w-5" />
                            </Link>
                        </Button>

                        <CartIcon />


                    </div>
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>

            <CartSheet dict={dict} />

            <footer className="border-t bg-muted/50 py-8 text-center text-sm text-muted-foreground">
                <div className="container mx-auto px-4">
                    <p>&copy; {new Date().getFullYear()} {dict.footer.copyright}</p>
                    <div className="mt-2 flex justify-center gap-4">
                        <Link href="/policy/privacy" className="hover:underline">{dict.footer.privacy}</Link>
                        <Link href="/policy/shipping" className="hover:underline">{dict.footer.shipping}</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
