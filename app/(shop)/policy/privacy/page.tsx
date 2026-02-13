import { prisma } from '@/lib/db'
import { getDictionary, getLocale } from '@/lib/i18n'

interface PolicySection {
    title: string
    content: string
}

export default async function PrivacyPolicyPage() {
    const locale = await getLocale()
    const policy = await prisma.policy.findUnique({
        where: { slug_locale: { slug: 'privacy', locale } }
    })

    // Fallback to i18n if DB has no data
    if (!policy) {
        const dict = await getDictionary()
        return (
            <div className="container px-4 py-12 max-w-3xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold font-serif mb-6">{dict.policy.privacy.title}</h1>
                <p className="text-muted-foreground">{dict.policy.privacy.intro}</p>
                <section className="space-y-2">
                    <h2 className="text-xl font-bold">{dict.policy.privacy.collect_title}</h2>
                    <p className="text-muted-foreground">{dict.policy.privacy.collect_desc}</p>
                </section>
                <section className="space-y-2">
                    <h2 className="text-xl font-bold">{dict.policy.privacy.use_title}</h2>
                    <p className="text-muted-foreground">{dict.policy.privacy.use_desc}</p>
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
