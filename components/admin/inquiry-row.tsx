'use client'

import { useState } from 'react'
import { Inquiry } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { TableCell, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { replyToInquiry, deleteInquiry } from '@/app/actions/inquiry'
import { Loader2, Trash2 } from 'lucide-react'

export function InquiryRow({ inquiry, dict }: { inquiry: Inquiry, dict: any }) {
    const [isSaving, setIsSaving] = useState(false)
    const [answer, setAnswer] = useState(inquiry.answer || '')
    const [isReplied, setIsReplied] = useState(inquiry.isReplied)

    // Email sending state
    const [sendEmail, setSendEmail] = useState(false)
    const [emailSubject, setEmailSubject] = useState(`[누나곰] 문의하신 내용에 대한 답변입니다.`)

    const handleSaveReply = async () => {
        if (!answer.trim()) return

        setIsSaving(true)

        const result = await replyToInquiry(inquiry.id, answer, {
            sendEmail,
            emailSubject,
            emailContent: answer,
            emailAddress: inquiry.contact.includes('@') ? inquiry.contact : undefined
        })

        if (result.success) {
            setIsReplied(true)
            if (result.emailSent) {
                alert('답변 저장 및 메일 발송이 완료되었습니다.')
            } else if (sendEmail && !result.emailSent) {
                alert(`답변은 저장되었으나 메일 발송에 실패했습니다: ${result.error || '알 수 없는 오류'}`)
            } else {
                alert('답변이 저장되었습니다.')
            }
        } else {
            alert('오류가 발생했습니다: ' + result.error)
        }
        setIsSaving(false)
    }

    const isEmailContact = inquiry.contact.includes('@')

    return (
        <TableRow>
            <TableCell>
                {new Date(inquiry.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="font-medium">{inquiry.name}</TableCell>
            <TableCell>{inquiry.contact}</TableCell>
            <TableCell className="max-w-md truncate" title={inquiry.content}>
                {inquiry.content}
            </TableCell>
            <TableCell>
                {isReplied ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {dict.admin.inquiry_list.status_replied}
                    </Badge>
                ) : (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        {dict.admin.inquiry_list.status_pending}
                    </Badge>
                )}
            </TableCell>
            <TableCell>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm">{dict.admin.inquiry_list.view}</Button>
                    </SheetTrigger>
                    <SheetContent className="overflow-y-auto sm:max-w-md">
                        <SheetHeader className="mb-6 px-6">
                            <SheetTitle>{dict.admin.inquiry_list.details_title}</SheetTitle>
                            <SheetDescription>
                                {new Date(inquiry.createdAt).toLocaleString()}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="space-y-6 px-6 pb-6">
                            <div>
                                <h3 className="font-medium mb-2">{dict.admin.inquiry_list.th_customer}</h3>
                                <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-1">
                                    <p><span className="font-semibold">{inquiry.name}</span></p>
                                    <p>{inquiry.contact}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">{dict.admin.inquiry_list.th_message}</h3>
                                <div className="bg-muted/50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                                    {inquiry.content}
                                </div>
                            </div>

                            <div className="border-t pt-4 space-y-4">
                                <Label htmlFor="answer">{dict.admin.inquiry_list.answer_label}</Label>
                                <Textarea
                                    id="answer"
                                    placeholder={dict.admin.inquiry_list.answer_placeholder}
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    rows={5}
                                />

                                <div className="space-y-3 pt-2 border-t mt-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="sendEmail"
                                            checked={sendEmail}
                                            onChange={(e) => setSendEmail(e.target.checked)}
                                            disabled={!isEmailContact}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor="sendEmail" className={!isEmailContact ? "text-muted-foreground" : ""}>
                                            메일로도 답변 전송하기 {isEmailContact ? '' : '(이메일 정보 없음)'}
                                        </Label>
                                    </div>

                                    {sendEmail && (
                                        <div className="pl-6 space-y-2">
                                            <Label htmlFor="subject" className="text-sm">메일 제목</Label>
                                            <Input
                                                id="subject"
                                                value={emailSubject}
                                                onChange={(e) => setEmailSubject(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end mt-4">
                                    <Button onClick={handleSaveReply} disabled={isSaving}>
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isSaving ? dict.admin.inquiry_list.saving : dict.admin.inquiry_list.save_reply}
                                    </Button>
                                </div>
                                {inquiry.repliedAt && (
                                    <p className="text-xs text-muted-foreground text-right">
                                        Last replied: {new Date(inquiry.repliedAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
                <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={async () => {
                        if (confirm(dict.admin.product_list.delete_confirm || "Are you sure you want to delete this inquiry?")) {
                            const result = await deleteInquiry(inquiry.id)
                            if (result.success) {
                                // Router refresh is handled by revalidatePath in server action,
                                // but we might need a manual refresh if it feels sluggish,
                                // though usually revalidatePath is sufficient for server components.
                            } else {
                                alert(result.error)
                            }
                        }
                    }}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </TableCell>
        </TableRow >
    )
}
