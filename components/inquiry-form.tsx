'use client'

import { useState, useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { submitInquiry } from '@/app/actions/inquiry'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'
import Turnstile from 'react-turnstile'

function SubmitButton({ label, pendingLabel }: { label: string, pendingLabel: string }) {
    const { pending } = useFormStatus()
    return <Button type="submit" className="w-full" disabled={pending}>{pending ? pendingLabel : label}</Button>
}

export function InquiryForm({ dict }: { dict: any }) {
    const [state, action] = useFormState(submitInquiry, undefined)
    const [isSuccess, setIsSuccess] = useState(false)

    useEffect(() => {
        if (state?.success) {
            setIsSuccess(true)
        }
    }, [state])

    if (isSuccess) {
        return (
            <Card>
                <CardContent className="pt-6 text-center space-y-4">
                    <div className="flex justify-center text-green-500">
                        <CheckCircle2 className="h-16 w-16" />
                    </div>
                    <h2 className="text-2xl font-bold">{dict.success.inquiry_title}</h2>
                    <p className="text-muted-foreground">
                        {dict.success.inquiry_desc}
                    </p>
                    <Button onClick={() => setIsSuccess(false)} variant="outline" className="mt-4">
                        {dict.success.back_home || "추가 문의하기"}
                    </Button>
                </CardContent>
            </Card>
        )
    }

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
                    {/* Honeypot Field (Hidden) */}
                    <div className="hidden opacity-0 absolute -z-10">
                        <Label htmlFor="website">Website</Label>
                        <Input id="website" name="website" tabIndex={-1} autoComplete="off" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">{dict.inquiry.message}</Label>
                        <Textarea id="content" name="content" required rows={5} placeholder="" />
                    </div>

                    {state?.error && (
                        <p className="text-red-500 text-sm text-center font-medium">{state.error}</p>
                    )}

                    <div className="text-xs text-center text-red-500">
                        * {dict.inquiry.spam_warning}
                    </div>

                    <div className="flex justify-center my-2">
                        {/* Cloudflare Turnstile (Smart Captcha) */}
                        <Turnstile
                            sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                            onVerify={(token) => {
                                const input = document.getElementById('cf-turnstile-response') as HTMLInputElement
                                if (input) input.value = token
                            }}
                        />
                        <input type="hidden" name="cf-turnstile-response" id="cf-turnstile-response" />
                    </div>

                    <SubmitButton label={dict.inquiry.submit} pendingLabel={dict.inquiry.submitting} />
                </form>
            </CardContent>
        </Card>
    )
}
