import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Order, OrderItem, Product } from '@prisma/client';

// Register a font that supports Korean
// Register a font that supports Korean
Font.register({
    family: 'NanumGothic',
    src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/nanumgothic/NanumGothic-Regular.ttf'
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 30,
        fontFamily: 'NanumGothic'
    },
    header: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold'
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: 5,
        marginBottom: 5
    },
    label: {
        width: 100,
        fontSize: 10,
        color: '#666'
    },
    value: {
        flex: 1,
        fontSize: 10
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#000',
        paddingBottom: 5,
        marginTop: 20,
        marginBottom: 10
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingVertical: 8
    },
    colName: { width: '60%', fontSize: 10 },
    colQty: { width: '10%', fontSize: 10, textAlign: 'center' },
    colPrice: { width: '30%', fontSize: 10, textAlign: 'right' },
    total: {
        marginTop: 20,
        textAlign: 'right',
        fontSize: 14,
        fontWeight: 'bold'
    }
});

type OrderWithItems = Order & {
    items: (OrderItem & { product: Product })[]
}

export const InvoicePDF = ({ order }: { order: OrderWithItems }) => {
    // Calculate totals
    const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const shippingFee = order.totalAmount - subtotal

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.header}>거 래 명 세 서</Text>

                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.label}>주문번호:</Text>
                        <Text style={styles.value}>{order.id}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>일자:</Text>
                        <Text style={styles.value}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>주문자:</Text>
                        <Text style={styles.value}>{order.customerName}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>이메일:</Text>
                        <Text style={styles.value}>{order.customerEmail || '-'}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>연락처:</Text>
                        <Text style={styles.value}>{order.customerPhone}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>주소:</Text>
                        <Text style={styles.value}>{order.address} {order.detailAddress}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.colName}>상품명</Text>
                        <Text style={styles.colQty}>수량</Text>
                        <Text style={styles.colPrice}>단가</Text>
                    </View>
                    {order.items.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.colName}>{item.product.title}</Text>
                            <Text style={styles.colQty}>{item.quantity}</Text>
                            <Text style={styles.colPrice}>{item.price.toLocaleString()}원</Text>
                        </View>
                    ))}

                    <View style={{ marginTop: 20 }}>
                        <Text style={{ ...styles.total, fontSize: 10, fontWeight: 'normal' }}>
                            주문금액: {subtotal.toLocaleString()}원
                        </Text>
                        <Text style={{ ...styles.total, fontSize: 10, fontWeight: 'normal', marginTop: 5 }}>
                            배송비: {shippingFee.toLocaleString()}원
                        </Text>
                        <Text style={styles.total}>
                            합계: {order.totalAmount.toLocaleString()}원
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
