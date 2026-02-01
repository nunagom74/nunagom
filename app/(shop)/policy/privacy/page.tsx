import { getDictionary } from '@/lib/i18n'

export default async function PrivacyPolicyPage() {
    const dict = await getDictionary()

    return (
        <div className="container px-4 py-12 max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold font-serif mb-6">{dict.policy.privacy.title}</h1>

            <p className="text-muted-foreground">
                {dict.policy.privacy.intro}
            </p>

            <section className="space-y-2">
                <h2 className="text-xl font-bold">{dict.policy.privacy.collect_title}</h2>
                <p className="text-muted-foreground">
                    {dict.policy.privacy.collect_desc}
                </p>
            </section>

            <section className="space-y-2">
                <h2 className="text-xl font-bold">{dict.policy.privacy.use_title}</h2>
                <p className="text-muted-foreground">
                    {dict.policy.privacy.use_desc}
                </p>
            </section>
        </div>
    )
}
