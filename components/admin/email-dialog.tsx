'use client'

import { useState, useTransition } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { sendOrderEmail } from "@/app/actions/email"

import { OrderStatus } from "@prisma/client"
import { useEffect } from "react"

interface EmailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    orderId: string
    orderStatus: OrderStatus
    customerName: string
    customerEmail?: string
    dict: any
    carrier?: string | null
    trackingNumber?: string | null
}

const getTrackingUrl = (carrier: string, number: string) => {
    switch (carrier) {
        case 'kr.epost': return `https://service.epost.go.kr/trace.RetrieveDomRgiTraceList.comm?sid1=${number}`
        case 'kr.cjlogistics': return `https://www.cjlogistics.com/ko/tool/parcel/tracking?gnrTlNo=${number}`
        case 'kr.lotte': return `https://www.lotteglogis.com/home/reservation/tracking/linkView?InvNo=${number}`
        case 'kr.hanjin': return `https://www.hanjin.com/kor/CMS/DeliveryMgr/WaybillResult.do?mCode=MN038&wblNum=${number}`
        case 'kr.logen': return `https://www.ilogen.com/web/personal/trace/${number}`
        default: return ''
    }
}

const getCarrierName = (carrier: string) => {
    switch (carrier) {
        case 'kr.epost': return '우체국택배'
        case 'kr.cjlogistics': return 'CJ대한통운'
        case 'kr.lotte': return '롯데택배'
        case 'kr.hanjin': return '한진택배'
        case 'kr.logen': return '로젠택배'
        default: return carrier
    }
}

const getTemplate = (status: OrderStatus, name: string, id: string, carrier?: string | null, trackingNumber?: string | null) => {
    const orderIdShort = id.slice(0, 8)

    switch (status) {
        case 'CONFIRMED':
            return {
                subject: `[누나곰] 주문 확인이 완료되었습니다 (주문번호: #${orderIdShort})`,
                body: `안녕하세요 ${name}님,\n\n고객님의 주문 확인(및 입금 확인)이 완료되었습니다.\n\n곧 제작 또는 배송 준비가 시작될 예정입니다.\n\n감사합니다.\n누나곰 드림`
            }
        case 'SHIPPED':
            let trackingInfo = ''
            if (carrier && trackingNumber) {
                const url = getTrackingUrl(carrier, trackingNumber)
                const carrierName = getCarrierName(carrier)

                trackingInfo = `\n\n[배송 정보]\n택배사: ${carrierName}\n송장번호: ${trackingNumber}`
                if (url) {
                    trackingInfo += `\n조회하기: ${url}`
                }
            }

            return {
                subject: `[누나곰] 상품이 발송되었습니다! (주문번호: #${orderIdShort})`,
                body: `안녕하세요 ${name}님,\n\n기다려주셔서 감사합니다. 주문하신 상품이 오늘 발송되었습니다.\n\n보통 1~3일(영업일 기준) 내에 수령하실 수 있습니다.${trackingInfo}\n\n감사합니다.\n누나곰 드림`
            }
        case 'DELIVERED':
            return {
                subject: `[누나곰] 상품은 마음에 드시나요? (주문번호: #${orderIdShort})`,
                body: `안녕하세요 ${name}님,\n\n상품이 배송 완료된 것으로 확인됩니다.\n\n누나곰의 친구가 마음에 드셨으면 좋겠습니다. 소중한 후기는 큰 힘이 됩니다!\n\n감사합니다.\n누나곰 드림`
            }
        case 'CANCELLED':
            return {
                subject: `[누나곰] 주문 취소 안내 (주문번호: #${orderIdShort})`,
                body: `안녕하세요 ${name}님,\n\n요청하신 주문 취소가 처리되었습니다.\n\n불편을 드려 죄송하며, 다음에 더 좋은 모습으로 뵙겠습니다.\n\n감사합니다.\n누나곰 드림`
            }
        case 'PENDING':
        default:
            return {
                subject: `[누나곰] 주문이 확인되었습니다 (주문번호: #${orderIdShort})`,
                body: `안녕하세요 ${name}님,\n\n누나곰을 찾아주셔서 감사합니다. 고객님의 주문이 성공적으로 접수되었습니다.\n\n첨부된 주문서를 확인해주시기 바라며, 배송이 시작되면 다시 안내해 드리겠습니다.\n\n감사합니다.\n누나곰 드림`
            }
    }
}

export function EmailDialog({
    open,
    onOpenChange,
    orderId,
    orderStatus,
    customerName,
    customerEmail,
    dict,
    carrier,
    trackingNumber
}: EmailDialogProps) {
    const [subject, setSubject] = useState("")
    const [body, setBody] = useState("")
    const [attachInvoice, setAttachInvoice] = useState(true)
    const [isPending, startTransition] = useTransition()

    useEffect(() => {
        if (open) {
            const template = getTemplate(orderStatus, customerName, orderId, carrier, trackingNumber)
            setSubject(template.subject)
            setBody(template.body)
        }
    }, [open, orderStatus, customerName, orderId, carrier, trackingNumber])

    const handleSend = () => {
        startTransition(async () => {
            const result = await sendOrderEmail(orderId, subject, body, attachInvoice)
            if (result.success) {
                alert(dict.admin.order_list.email_sent)
                onOpenChange(false)
            } else {
                alert('Failed to send email: ' + (result.error || 'Unknown error'))
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{dict.admin.order_list.send_email}</DialogTitle>
                    <DialogDescription>
                        To: {customerEmail || 'No email provided'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="subject" className="text-right">
                            {dict.admin.order_list.email_subject}
                        </Label>
                        <Input
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <Label htmlFor="body" className="text-right pt-2">
                            {dict.admin.order_list.email_body}
                        </Label>
                        <Textarea
                            id="body"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="col-span-3 h-[200px]"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <div className="col-start-2 col-span-3 flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="attach"
                                checked={attachInvoice}
                                onChange={(e) => setAttachInvoice(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="attach">{dict.admin.order_list.attach_invoice}</Label>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        {dict.admin.order_list.cancel}
                    </Button>
                    <Button onClick={handleSend} disabled={isPending || !customerEmail}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isPending ? dict.admin.order_list.sending : dict.admin.order_list.send}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
