import { prisma } from '@/lib/db'
import { getDictionary, getLocale } from '@/lib/i18n'
import { PolicyForm } from '@/components/admin/policy-form'
import { notFound } from 'next/navigation'

const VALID_SLUGS = ['privacy', 'shipping']

export default async function EditPolicyPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const dict = await getDictionary()
    const locale = await getLocale()

    if (!VALID_SLUGS.includes(slug)) {
        notFound()
    }

    const koPolicy = await prisma.policy.findUnique({
        where: { slug_locale: { slug, locale: 'ko' } }
    })
    const enPolicy = await prisma.policy.findUnique({
        where: { slug_locale: { slug, locale: 'en' } }
    })

    return (
        <PolicyForm
            slug={slug}
            koPolicy={koPolicy}
            enPolicy={enPolicy}
            dict={dict}
            currentLocale={locale}
        />
    )
}
