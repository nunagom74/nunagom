import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { Order, OrderItem, Product } from '@prisma/client';

// Register a font that supports Korean
Font.register({
    family: 'NotoSansKR',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/notosanskr/v39/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuoyeLQ.ttf', fontWeight: 400 },
        { src: 'https://fonts.gstatic.com/s/notosanskr/v39/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzg01eLQ.ttf', fontWeight: 700 }
    ]
});

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'NotoSansKR',
        fontSize: 10,
        color: '#333',
        lineHeight: 1.5
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Changed from center to flex-start to avoid overlap if titles are large
        borderBottomWidth: 2,
        borderBottomColor: '#111',
        paddingBottom: 10,
        marginBottom: 30
    },
    brand: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111'
    },
    brandSub: {
        fontSize: 10,
        color: '#666',
        marginTop: 2
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#111',
        marginTop: 5
    },
    infoGrid: {
        flexDirection: 'row',
        marginBottom: 30,
        gap: 30
    },
    col: {
        flex: 1
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#666',
        textTransform: 'uppercase',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: 4,
        marginBottom: 8
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4
    },
    label: {
        color: '#666',
        width: 60
    },
    val: {
        flex: 1,
        textAlign: 'right'
    },
    valLeft: {
        flex: 1,
        textAlign: 'left'
    },
    table: {
        marginTop: 10,
        marginBottom: 20
    },
    th: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        borderBottomWidth: 1,
        borderBottomColor: '#DDD',
        paddingVertical: 8,
        paddingHorizontal: 4
    },
    tr: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingVertical: 8,
        paddingHorizontal: 4,
        alignItems: 'center',
        minHeight: 40 // Ensure minimum height for rows with images
    },
    tdIdx: { width: '8%', textAlign: 'center' },
    tdImage: { width: '15%', paddingRight: 10 },
    tdItem: { width: '37%' },
    tdQty: { width: '15%', textAlign: 'center' },
    tdPrice: { width: '25%', textAlign: 'right' },
    image: { width: 40, height: 40, objectFit: 'cover', borderRadius: 4, backgroundColor: '#EEE' },

    totalSection: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        marginTop: 10
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 250,
        marginBottom: 5
    },
    totalLabel: {
        color: '#666'
    },
    totalVal: {
        fontWeight: 'bold'
    },
    grandTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 250,
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 2,
        borderTopColor: '#111'
    },
    grandTotalLabel: {
        fontSize: 12,
        fontWeight: 'bold'
    },
    grandTotalVal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111'
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        paddingTop: 20,
        color: '#999',
        fontSize: 9
    }
});

type OrderWithItems = Order & {
    items: (OrderItem & { product: Product })[]
}

export const InvoicePDF = ({ order, dict }: { order: OrderWithItems, dict: any }) => {
    const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const shippingFee = order.totalAmount - subtotal

    // Format date as YYYY. MM. DD.
    const date = new Date(order.createdAt);
    const dateStr = `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}.`;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ flexDirection: 'column' }}>
                        <Text style={styles.brand}>Nuna Gom</Text>
                        <Text style={styles.brandSub}>Handmade Knitted Bears</Text>
                    </View>
                    <Text style={styles.title}>{dict?.admin?.order_list?.invoice_title || "INVOICE"}</Text>
                </View>

                {/* Info Section */}
                <View style={styles.infoGrid}>
                    <View style={styles.col}>
                        <Text style={styles.sectionTitle}>{dict?.admin?.order_list?.bill_to || "Bill To"}</Text>
                        <View style={styles.row}>
                            <Text style={styles.valLeft}>{order.customerName}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.valLeft}>{order.customerPhone}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.valLeft}>{order.customerEmail || ''}</Text>
                        </View>
                        <View style={{ marginTop: 10 }}>
                            <Text style={styles.valLeft}>{order.address}</Text>
                            <Text style={styles.valLeft}>{order.detailAddress}</Text>
                        </View>
                    </View>
                    <View style={styles.col}>
                        <Text style={styles.sectionTitle}>{dict?.admin?.order_list?.order_info || "Order Info"}</Text>
                        <View style={styles.row}>
                            <Text style={styles.label}>{dict?.admin?.order_list?.th_id || "Order No."}</Text>
                            <Text style={styles.val}>{order.id.slice(0, 8).toUpperCase()}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{dict?.admin?.order_list?.th_date || "Date"}</Text>
                            <Text style={styles.val}>{dateStr}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>{dict?.admin?.order_list?.th_status || "Status"}</Text>
                            <Text style={styles.val}>{order.status}</Text>
                        </View>
                        {(order.trackingNumber) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Shipping</Text>
                                <Text style={styles.val}>{order.carrier?.replace('kr.', '')?.toUpperCase()} {order.trackingNumber}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Message if exists */}
                {order.message && (
                    <View style={{ marginBottom: 20, backgroundColor: '#F9F9F9', padding: 10, borderRadius: 4 }}>
                        <Text style={{ fontSize: 9, color: '#666', marginBottom: 4 }}>Message:</Text>
                        <Text>"{order.message}"</Text>
                    </View>
                )}

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.th}>
                        <Text style={styles.tdIdx}>#</Text>
                        <Text style={styles.tdImage}>{dict?.admin?.product_list?.th_image || "Image"}</Text>
                        <Text style={styles.tdItem}>{dict?.admin?.product_list?.th_name || "Description"}</Text>
                        <Text style={styles.tdQty}>{dict?.order?.quantity || "Qty"}</Text>
                        <Text style={styles.tdPrice}>{dict?.admin?.product_list?.th_price || "Price"}</Text>
                    </View>
                    {order.items.map((item, idx) => (
                        <View key={item.id} style={styles.tr}>
                            <Text style={styles.tdIdx}>{idx + 1}</Text>
                            <View style={styles.tdImage}>
                                {item.product.images[0] ? (
                                    <Image src={item.product.images[0]} style={styles.image} />
                                ) : (
                                    <View style={styles.image} />
                                )}
                            </View>
                            <View style={styles.tdItem}>
                                <Text style={{ fontWeight: 'bold' }}>{item.product.title}</Text>
                                {item.options && typeof item.options === 'object' && (
                                    <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>
                                        {Object.entries(item.options).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                    </Text>
                                )}
                            </View>
                            <Text style={styles.tdQty}>{item.quantity}</Text>
                            <Text style={styles.tdPrice}>
                                {(item.price * item.quantity).toLocaleString()} {dict?.product?.price_unit || "KRW"}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Totals */}
                <View style={styles.totalSection}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>{dict?.order?.subtotal || "Subtotal"}</Text>
                        <Text style={styles.totalVal}>{subtotal.toLocaleString()} {dict?.product?.price_unit}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>{dict?.order?.shipping_fee || "Shipping"}</Text>
                        <Text style={styles.totalVal}>{shippingFee.toLocaleString()} {dict?.product?.price_unit}</Text>
                    </View>
                    <View style={styles.grandTotal}>
                        <Text style={styles.grandTotalLabel}>{dict?.order?.total || "Total"}</Text>
                        <Text style={styles.grandTotalVal}>{order.totalAmount.toLocaleString()} {dict?.product?.price_unit || "KRW"}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>{dict?.admin?.order_list?.thank_you || "Thank you for your business!"}</Text>
                    <Text style={{ marginTop: 4 }}>Nuna Gom | Handmade Knitted Bears</Text>
                </View>
            </Page>
        </Document>
    );
};
