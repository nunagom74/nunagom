'use client'
import { upload } from '@vercel/blob/client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createProduct, updateProduct } from '@/app/actions/product'
import { useState } from 'react'

interface ProductFormProps {
    product?: {
        id: string
        title: string
        slug: string
        price: number
        description: string
        images: string[]
        madeToOrder: boolean
        stock: number | null
        leadTimeDays: number | null
    }
    dict: any
}

export function ProductForm({ product, dict }: ProductFormProps) {
    const isEdit = !!product
    const action = isEdit ? updateProduct.bind(null, product.id) : createProduct

    const [uploading, setUploading] = useState(false)
    const [images, setImages] = useState<string[]>(product?.images || [])
    const [title, setTitle] = useState(product?.title || '')
    const [slug, setSlug] = useState(product?.slug || '')
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!product?.slug)

    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^a-z0-9\uAC00-\uD7A3\-]+/g, '') // Remove non-word chars (keep Korean)
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value
        setTitle(newTitle)
        if (!isSlugManuallyEdited) {
            setSlug(slugify(newTitle))
        }
    }

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlug(e.target.value)
        setIsSlugManuallyEdited(true)
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)

        try {
            const newBlob = await upload(file.name, file, {
                access: 'public',
                handleUploadUrl: '/api/upload',
            })
            setImages(prev => [...prev, newBlob.url])
        } catch (err) {
            console.error('Upload failed', err)
            alert('업로드 실패: ' + (err as Error).message)
        } finally {
            setUploading(false)
            // Reset input
            e.target.value = ''
        }
    }

    const handleRemoveImage = (url: string) => {
        setImages(prev => prev.filter(i => i !== url))
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/products">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">
                    {isEdit ? dict.admin.product_form.edit_title : dict.admin.product_form.add_title}
                </h1>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form action={action} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">{dict.admin.product_form.title}</Label>
                            <Input
                                id="title"
                                name="title"
                                required
                                value={title}
                                onChange={handleTitleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="slug">{dict.admin.product_form.slug}</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    required
                                    value={slug}
                                    onChange={handleSlugChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">{dict.admin.product_form.price}</Label>
                                <Input id="price" name="price" type="number" required defaultValue={product?.price} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">{dict.admin.product_form.description}</Label>
                            <Textarea id="description" name="description" required rows={5} defaultValue={product?.description} />
                        </div>

                        <div className="space-y-4">
                            <Label>{dict.admin.product_form.images}</Label>

                            {/* Existing Images */}
                            {images.length > 0 && (
                                <div className="flex gap-4 mb-4 flex-wrap">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative w-20 h-20 border rounded overflow-hidden group">
                                            <img src={img} alt="Product" className="object-cover w-full h-full" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(img)}
                                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                {dict.admin.product_form.remove}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload Input */}
                            <div className="flex items-center gap-4">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    className="max-w-xs"
                                />
                                {uploading && <span className="text-sm text-muted-foreground">{dict.admin.product_form.uploading}</span>}
                            </div>

                            {/* Hidden Input for Server Action */}
                            <input type="hidden" name="images" value={images.join(',')} />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="madeToOrder"
                                name="madeToOrder"
                                className="h-4 w-4 rounded border-gray-300"
                                defaultChecked={product?.madeToOrder}
                            />
                            <Label htmlFor="madeToOrder">{dict.admin.product_form.made_to_order}</Label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="stock">{dict.admin.product_form.stock}</Label>
                                <Input id="stock" name="stock" type="number" defaultValue={product?.stock || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="leadTimeDays">{dict.admin.product_form.lead_time}</Label>
                                <Input id="leadTimeDays" name="leadTimeDays" type="number" defaultValue={product?.leadTimeDays || 7} />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit">
                                {isEdit ? dict.admin.product_form.update_btn : dict.admin.product_form.create_btn}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
