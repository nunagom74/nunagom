import { prisma } from '@/lib/db'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function InquiriesPage() {
    const inquiries = await prisma.inquiry.findMany({
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-serif text-primary">Inquiries</h1>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Message</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inquiries.map((inquiry) => (
                            <TableRow key={inquiry.id}>
                                <TableCell>
                                    {new Date(inquiry.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="font-medium">{inquiry.name}</TableCell>
                                <TableCell>{inquiry.contact}</TableCell>
                                <TableCell className="max-w-md truncate" title={inquiry.content}>
                                    {inquiry.content}
                                </TableCell>
                            </TableRow>
                        ))}
                        {inquiries.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                    No inquiries found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
