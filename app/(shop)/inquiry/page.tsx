import { Suspense } from 'react'
import { getDictionary } from '@/lib/i18n'
import { InquiryForm } from '@/components/inquiry-form'

export default async function InquiryPage() {
    const dict = await getDictionary()

    return (
        <div className="container px-4 py-12 max-w-xl mx-auto">
            <h1 className="text-3xl font-bold font-serif mb-8 text-center text-primary">{dict.inquiry.title}</h1>
            <Suspense fallback={<div className="text-center">Loading form...</div>}>
                <InquiryForm dict={dict} />
            </Suspense>
        </div>
    )
}
