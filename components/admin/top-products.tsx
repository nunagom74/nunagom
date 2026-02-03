import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TopProduct {
    id: string
    title: string
    price: number
    image: string | null
    soldCount: number
}

interface TopProductsProps {
    products: TopProduct[]
    dict: any
}

export function TopProducts({ products, dict }: TopProductsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{dict.admin.dashboard_top_products || "Top Selling Products"}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {products.map((product, index) => (
                        <div key={product.id} className="flex items-center">
                            <div className="w-8 flex justify-center">
                                <span className={`
                                    flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold
                                    ${index === 0 ? "bg-amber-100 text-amber-700" :
                                        index === 1 ? "bg-slate-100 text-slate-700" :
                                            index === 2 ? "bg-orange-50 text-orange-700" : "text-muted-foreground"}
                                `}>
                                    {index + 1}
                                </span>
                            </div>
                            <Avatar className="h-10 w-10 rounded-md border">
                                <AvatarImage src={product.image || undefined} alt={product.title} className="object-cover" />
                                <AvatarFallback>{product.title.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1 flex-1">
                                <p className="text-sm font-medium leading-none line-clamp-1">{product.title}</p>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <span>{product.price.toLocaleString()} KRW</span>
                                    <span className="mx-1">•</span>
                                    <span className="font-medium text-foreground">{product.soldCount} sold</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
