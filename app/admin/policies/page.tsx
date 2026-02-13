import { prisma } from '@/lib/db'
import { getDictionary } from '@/lib/i18n'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, ChevronRight } from 'lucide-react'

export default async function PoliciesPage() {
    const dict = await getDictionary()
    const d = dict.admin.policies
    const policies = await prisma.policy.findMany({
        orderBy: [{ slug: 'asc' }, { locale: 'asc' }]
    })

    // Group by slug
    const grouped = policies.reduce((acc, p) => {
        if (!acc[p.slug]) acc[p.slug] = []
        acc[p.slug].push(p)
        return acc
    }, {} as Record<string, typeof policies>)

    const policyMeta = [
        { slug: 'privacy', label: d.privacy },
        { slug: 'shipping', label: d.shipping },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">{d.title}</h1>

            <div className="grid gap-4">
                {policyMeta.map(({ slug, label }) => {
                    const items = grouped[slug] || []
                    const updatedAt = items.reduce((latest, p) => {
                        return p.updatedAt > latest ? p.updatedAt : latest
                    }, new Date(0))

                    return (
                        <Card key={slug}>
                            <CardContent className="flex items-center justify-between py-4">
                                <div className="flex items-center gap-4">
                                    <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                                    <div>
                                        <p className="font-medium">{label}</p>
                                        {items.length > 0 && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {d.last_updated}: {updatedAt.toLocaleDateString('ko-KR')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {items.map(p => (
                                        <Badge key={p.locale} variant="outline">
                                            {p.locale.toUpperCase()}
                                        </Badge>
                                    ))}
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/admin/policies/${slug}`}>
                                            {d.edit}
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
