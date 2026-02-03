'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Plus, MoreHorizontal, Pencil, Trash, GripVertical, Save } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteProduct, reorderProducts } from '@/app/actions/product'
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
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Product {
    id: string
    title: string
    price: number
    stock: number | null
    madeToOrder: boolean
    images: string[]
    order: number
}

interface ProductListProps {
    products: Product[]
    dict: any
}

function SortableRow({ product, dict }: { product: Product, dict: any }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: product.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: isDragging ? 'relative' : undefined,
    } as React.CSSProperties;

    return (
        <TableRow ref={setNodeRef} style={style} className={isDragging ? 'opacity-50 bg-muted' : ''}>
            <TableCell>
                <div {...attributes} {...listeners} className="cursor-grab touch-none p-2 hover:bg-muted rounded">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
            </TableCell>
            <TableCell>
                {product.images[0] && (
                    <img
                        src={product.images[0]}
                        alt={product.title}
                        className="h-10 w-10 rounded-md object-cover bg-muted"
                    />
                )}
            </TableCell>
            <TableCell className="font-medium">
                {product.title}
            </TableCell>
            <TableCell>{product.price.toLocaleString()} {dict.product.price_unit}</TableCell>
            <TableCell>
                {product.madeToOrder ? (
                    <span className="text-amber-600 text-xs font-medium">{dict.admin.product_list.made_to_order}</span>
                ) : (
                    <span>{product.stock} {dict.admin.product_list.in_stock}</span>
                )}
            </TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{dict.admin.product_list.th_actions}</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/admin/products/${product.id}`}>
                                <Pencil className="mr-2 h-4 w-4" /> {dict.admin.product_list.edit}
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                            <form action={deleteProduct.bind(null, product.id)} className="w-full flex items-center">
                                <button type="submit" className="flex items-center w-full">
                                    <Trash className="mr-2 h-4 w-4" /> {dict.admin.product_list.delete}
                                </button>
                            </form>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    )
}

export function ProductList({ products: initialProducts, dict }: ProductListProps) {
    const [products, setProducts] = useState(initialProducts)
    const [isSaving, setIsSaving] = useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = products.findIndex((product) => product.id === active.id);
            const newIndex = products.findIndex((product) => product.id === over.id);

            const newProducts = arrayMove(products, oldIndex, newIndex);

            // Assign new order based on index
            const orderedProducts = newProducts.map((p, index) => ({
                ...p,
                order: index
            }));

            setProducts(orderedProducts);

            // Save to server
            setIsSaving(true)
            try {
                const updates = orderedProducts.map(p => ({
                    id: p.id,
                    order: p.order
                }))
                await reorderProducts(updates)
            } catch (error) {
                console.error("Failed to save order", error)
                // Revert on error? Or just show toast?
            } finally {
                setIsSaving(false)
            }
        }
    };

    return (
        <div className="space-y-4">
            {isSaving && <div className="text-sm text-muted-foreground animate-pulse">Saving order...</div>}

            <div className="rounded-md border bg-card">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead>
                                <TableHead>{dict.admin.product_list.th_image}</TableHead>
                                <TableHead>{dict.admin.product_list.th_name}</TableHead>
                                <TableHead>{dict.admin.product_list.th_price}</TableHead>
                                <TableHead>{dict.admin.product_list.th_stock}</TableHead>
                                <TableHead className="w-[100px]">{dict.admin.product_list.th_actions}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <SortableContext
                                items={products.map(p => p.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {products.map((product) => (
                                    <SortableRow key={product.id} product={product} dict={dict} />
                                ))}
                            </SortableContext>
                            {products.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        {dict.admin.product_list.empty}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </DndContext>
            </div>
        </div>
    )
}
