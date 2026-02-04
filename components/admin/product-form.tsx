'use client'
import { upload } from '@vercel/blob/client'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createProduct, updateProduct } from '@/app/actions/product'
import { useState } from 'react'

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';
import { Download, X } from 'lucide-react';

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

interface ImageItem {
    id: string;
    url: string;
}

function SortableImage({
    id,
    url,
    onRemove,
    onDownload,
    dict
}: {
    id: string
    url: string
    onRemove: (id: string) => void
    onDownload: (url: string) => void
    dict: any
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative w-24 h-24 border rounded overflow-hidden group select-none touch-none bg-background"
        >
            <Image
                src={url}
                alt="Product"
                fill
                className="object-cover pointer-events-none"
                sizes="96px"
            />

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/50 text-white z-10 flex items-center justify-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onDownload(url)}
                    className="p-1.5 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
                    title={dict.admin.product_form.download || "Download"}
                >
                    <Download className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onRemove(id)}
                    className="p-1.5 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
                    title={dict.admin.product_form.remove}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export function ProductForm({ product, dict }: ProductFormProps) {
    const isEdit = !!product
    const action = isEdit ? updateProduct.bind(null, product.id) : createProduct

    const [uploading, setUploading] = useState(false)
    // Initialize with unique IDs
    const [images, setImages] = useState<ImageItem[]>(() =>
        (product?.images || []).map(url => ({ id: uuidv4(), url }))
    )
    const [title, setTitle] = useState(product?.title || '')
    const [slug, setSlug] = useState(product?.slug || '')
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!product?.slug)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Slightly reduced distance for easier drag
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDownloadImage = (url: string) => {
        // Create a temporary link to download the image
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.download = url.split('/').pop() || 'image';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
            const uniqueFilename = `${uuidv4()}-${file.name}`
            const newBlob = await upload(uniqueFilename, file, {
                access: 'public',
                handleUploadUrl: '/api/upload',
            })
            setImages(prev => [...prev, { id: uuidv4(), url: newBlob.url }])
        } catch (err) {
            console.error('Upload failed', err)
            alert('업로드 실패: ' + (err as Error).message)
        } finally {
            setUploading(false)
            // Reset input
            e.target.value = ''
        }
    }

    const handleRemoveImage = (id: string) => {
        setImages(prev => prev.filter(i => i.id !== id))
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setImages((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

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
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={images.map(i => i.id)}
                                    strategy={rectSortingStrategy}
                                >
                                    <div className="flex gap-4 mb-4 flex-wrap">
                                        {images.map((item) => (
                                            <SortableImage
                                                key={item.id}
                                                id={item.id}
                                                url={item.url}
                                                onRemove={handleRemoveImage}
                                                onDownload={handleDownloadImage}
                                                dict={dict}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>

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
                            <input type="hidden" name="images" value={images.map(i => i.url).join(',')} />
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
                                <Input id="stock" name="stock" type="number" defaultValue={product?.stock ?? ''} />
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
