'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFormState, useFormStatus } from 'react-dom'
import DaumPostcodeEmbed from 'react-daum-postcode'
import { Search } from 'lucide-react'

import { submitOrder } from '@/app/actions/order'
import { useCart } from '@/lib/store/use-cart'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

function SubmitButton({ label, pendingLabel }: { label: string, pendingLabel: string }) {
    const { pending } = useFormStatus()
    return <Button type="submit" className="w-full" disabled={pending}>{pending ? pendingLabel : label}</Button>
}

export function OrderFormClient({ dict }: { dict: any }) {
    const searchParams = useSearchParams()
    const productId = searchParams.get('productId')
    const { items: cartItems, clearCart } = useCart()
    const [state, action] = useFormState(submitOrder, undefined)

    const [address, setAddress] = useState('')
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
    const [phone, setPhone] = useState('')

    // Determine Mode
    const isDirectBuy = !!productId
    // If not direct buy, use cart items. 
    // If direct buy, we need to fetch product info? 
    // Currently the form asks for quantity, implying product info is widely known or just ID is enough.
    // Ideally for Direct Buy we show what we are buying.
    // But keeping it simple for now as requested "maintain UI/UX".

    // For Cart Mode, we need to pass items as JSON
    const orderItemsJSON = isDirectBuy ? '' : JSON.stringify(cartItems.map(item => ({ id: item.id, quantity: item.quantity })))

    // Calculate total for display (Cart Mode only)
    const cartItemsTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    // Shipping fee logic: Max of all items
    const shippingFee = cartItems.reduce((acc, item) => Math.max(acc, item.shippingFee || 3000), 0)
    const totalWithShipping = cartItemsTotal + shippingFee

    const handleComplete = (data: any) => {
        let fullAddress = data.address
        let extraAddress = ''

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName)
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '')
        }

        setAddress(fullAddress)
        setIsAddressModalOpen(false)
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '')
        let formattedValue = rawValue

        if (rawValue.length > 3 && rawValue.length <= 7) {
            formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3)}`
        } else if (rawValue.length > 7) {
            formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 7)}-${rawValue.slice(7, 11)}`
        }

        if (rawValue.length > 11) {
            formattedValue = `${rawValue.slice(0, 3)}-${rawValue.slice(3, 7)}-${rawValue.slice(7, 11)}`
        }

        setPhone(formattedValue)
    }

    if (!isDirectBuy && cartItems.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center space-y-4">
                    <p className="text-muted-foreground text-lg">장바구니가 비어있습니다.</p>
                    <Button asChild>
                        <a href="/products">쇼핑 계속하기</a>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>{dict.order.shipping_contact}</span>
                    {!isDirectBuy && <span className="text-lg text-primary">{totalWithShipping.toLocaleString()} {dict.product.price_unit}</span>}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form action={action} className="space-y-6">
                    {/* Hidden Inputs determine mode */}
                    {isDirectBuy ? (
                        <input type="hidden" name="productId" value={productId} />
                    ) : (
                        <input type="hidden" name="items" value={orderItemsJSON} />
                    )}

                    {!isDirectBuy && (
                        <div className="bg-muted/30 p-4 rounded-lg space-y-2 mb-4">
                            <h3 className="font-semibold mb-2">주문 상품 ({cartItems.length})</h3>
                            {cartItems.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.title} x {item.quantity}</span>
                                    <span>{(item.price * item.quantity).toLocaleString()} {dict.product.price_unit}</span>
                                </div>
                            ))}
                            <div className="border-t pt-2 mt-2 space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{dict.order.subtotal || "Subtotal"}</span>
                                    <span>{cartItemsTotal.toLocaleString()} {dict.product.price_unit}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{dict.order.shipping_fee || "Shipping"}</span>
                                    <span>{shippingFee.toLocaleString()} {dict.product.price_unit}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                                    <span>{dict.order.total || "Total"}</span>
                                    <span>{totalWithShipping.toLocaleString()} {dict.product.price_unit}</span>
                                </div>
                            </div>
                        </div>
                    )}

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
                        <Input
                            id="customerPhone"
                            name="customerPhone"
                            required
                            placeholder="010-0000-0000"
                            value={phone}
                            onChange={handlePhoneChange}
                            maxLength={13}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">{dict.order.address}</Label>
                        <div className="flex gap-2">
                            <Textarea
                                id="address"
                                name="address"
                                required
                                placeholder={dict.order.address_placeholder || "주소를 입력해주세요"}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="resize-none"
                            />
                            <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                                <DialogTrigger asChild>
                                    <Button type="button" variant="outline" size="icon" className="h-20 w-20 shrink-0">
                                        <Search className="h-6 w-6" />
                                        <span className="sr-only">Search Address</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md p-0">
                                    <DialogHeader className="p-4 pb-2">
                                        <DialogTitle>주소 검색</DialogTitle>
                                    </DialogHeader>
                                    <div className="h-[400px]">
                                        <DaumPostcodeEmbed
                                            onComplete={handleComplete}
                                            style={{ height: '100%' }}
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Quantity input only for direct buy */}
                    {isDirectBuy && (
                        <div className="space-y-2">
                            <Label htmlFor="quantity">{dict.order.quantity}</Label>
                            <Input id="quantity" name="quantity" type="number" min="1" defaultValue="1" required />
                        </div>
                    )}

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
