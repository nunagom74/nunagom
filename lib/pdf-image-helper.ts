
import { Order, OrderItem, Product } from '@prisma/client';

type OrderWithItems = Order & {
    items: (OrderItem & { product: Product })[]
}

export async function optimizeOrderImages(order: OrderWithItems): Promise<OrderWithItems> {
    // Clone order to avoid mutation issues if any
    const newOrder = { ...order, items: [...order.items] };

    // Base URL for fetching optimized images
    // In Vercel, we can use the deployment URL. Locally, localhost.
    // WARNING: Fetching from own Next.js API in Server Action might fail if internal networking isn't set up.
    // Ideally we use the public URL.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    for (let i = 0; i < newOrder.items.length; i++) {
        const item = newOrder.items[i];
        if (item.product.images && item.product.images.length > 0) {
            const originalUrl = item.product.images[0];

            // Skip if already data uri
            if (originalUrl.startsWith('data:')) continue;

            try {
                // Construct optimization URL
                const optimizedUrl = `${baseUrl}/_next/image?url=${encodeURIComponent(originalUrl)}&w=128&q=75`;

                // Fetch the image
                const response = await fetch(optimizedUrl);
                if (!response.ok) {
                    console.warn(`Failed to fetch optimized image: ${response.status} ${response.statusText}`);
                    continue;
                }

                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const base64 = buffer.toString('base64');

                // Determine mime type (default to png if unknown, but response headers usually have it)
                const contentType = response.headers.get('content-type') || 'image/png';

                // Replace image URL with Data URI
                // We create a shallow copy of product to modify images array
                const newProduct = { ...item.product, images: [`data:${contentType};base64,${base64}`] };
                newOrder.items[i] = { ...item, product: newProduct };

            } catch (error) {
                console.error('Error optimizing image for PDF:', error);
                // Keep original URL if optimization fails
            }
        }
    }

    return newOrder;
}
