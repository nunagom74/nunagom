import { getDictionary } from '@/lib/i18n'

export default async function ShippingPolicyPage() {
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
