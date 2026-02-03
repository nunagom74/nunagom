'use client'

import { useSearchParams } from 'next/navigation'
import { useFormState, useFormStatus } from 'react-dom'
import { submitOrder } from '@/app/actions/order'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function SubmitButton({ label, pendingLabel }: { label: string, pendingLabel: string }) {
    const { pending } = useFormStatus()
    return <Button type="submit" className="w-full" disabled={pending}>{pending ? pendingLabel : label}</Button>
}

export function OrderFormClient({ dict }: { dict: any }) {
    const searchParams = useSearchParams()
    const productId = searchParams.get('productId')
    const [state, action] = useFormState(submitOrder, undefined)

    return (
        <Card>
            <CardHeader>
                <CardTitle>{dict.order.shipping_contact}</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={action} className="space-y-6">
                    <input type="hidden" name="productId" value={productId || ''} />

                    <div className="space-y-2">
                        <Label htmlFor="customerName">{dict.order.name}</Label>
                        <Input id="customerName" name="customerName" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customerEmail">Email (Optional)</Label>
                        <Input id="customerEmail" name="customerEmail" type="email" placeholder="example@email.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="customerPhone">{dict.order.phone}</Label>
                        <Input id="customerPhone" name="customerPhone" required placeholder="010-0000-0000" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">{dict.order.address}</Label>
                        <Textarea id="address" name="address" required placeholder={dict.order.address_placeholder || "주소를 입력해주세요"} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="quantity">{dict.order.quantity}</Label>
                        <Input id="quantity" name="quantity" type="number" min="1" defaultValue="1" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">{dict.order.message}</Label>
                        <Textarea id="message" name="message" placeholder="" />
                    </div>

                    {state?.error && (
                        <p className="text-red-500 text-sm text-center">{state.error}</p>
                    )}

                    <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground mb-4 text-center">
                            {dict.order.payment_info}
                        </p>
                        <SubmitButton label={dict.order.submit} pendingLabel={dict.order.submitting} />
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
