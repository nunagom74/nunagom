import { prisma } from '@/lib/db'
import { getDictionary, getLocale } from '@/lib/i18n'

interface PolicySection {
    title: string
    content: string
}

export default async function ShippingPolicyPage() {
    const locale = await getLocale()
    const policy = await prisma.policy.findUnique({
        where: { slug_locale: { slug: 'shipping', locale } }
    })

    // Fallback to i18n if DB has no data
    if (!policy) {
        const dict = await getDictionary()
        return (
            <div className="container px-4 py-12 max-w-3xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold font-serif mb-6">{dict.policy.shipping.title}</h1>
                <section className="space-y-2">
                    <h2 className="text-xl font-bold">{dict.policy.shipping.shipping_title}</h2>
                    <div className="text-muted-foreground space-y-1">
                        {(dict.policy.shipping.shipping_desc as string[]).map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>
                </section>
                <section className="space-y-2">
                    <h2 className="text-xl font-bold">{dict.policy.shipping.return_title}</h2>
                    <div className="text-muted-foreground space-y-1">
                        {(dict.policy.shipping.return_desc as string[]).map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>
                </section>
            </div>
        )
    }

    const sections = policy.sections as unknown as PolicySection[]

    return (
        <div className="container px-4 py-12 max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold font-serif mb-6">{policy.title}</h1>

            {policy.intro && (
                <p className="text-muted-foreground">{policy.intro}</p>
            )}

            {sections.map((section, i) => (
                <section key={i} className="space-y-2">
                    <h2 className="text-xl font-bold">{section.title}</h2>
                    <div className="text-muted-foreground space-y-1">
                        {section.content.split('\n').map((line, j) => (
                            <p key={j}>{line}</p>
                        ))}
                    </div>
                </section>
            ))}
        </div>
    )
}
