'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { submitInquiry } from '@/app/actions/order'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function SubmitButton({ label, pendingLabel }: { label: string, pendingLabel: string }) {
    const { pending } = useFormStatus()
    return <Button type="submit" className="w-full" disabled={pending}>{pending ? pendingLabel : label}</Button>
}

export function InquiryForm({ dict }: { dict: any }) {
    const [state, action] = useFormState(submitInquiry, undefined)

    return (
        <Card>
            <CardHeader>
                <CardTitle>{dict.inquiry.subtitle}</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={action} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">{dict.inquiry.name}</Label>
                        <Input id="name" name="name" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contact">{dict.inquiry.contact}</Label>
                        <Input id="contact" name="contact" required placeholder="" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">{dict.inquiry.message}</Label>
                        <Textarea id="content" name="content" required rows={5} placeholder="" />
                    </div>

                    {state?.error && (
                        <p className="text-red-500 text-sm text-center">{state.error}</p>
                    )}

                    <SubmitButton label={dict.inquiry.submit} pendingLabel={dict.inquiry.submitting} />
                </form>
            </CardContent>
        </Card>
    )
}
