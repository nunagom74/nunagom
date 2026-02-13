import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = `${process.env.DATABASE_URL}`

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Start seeding ...')

  // Create Admin (if you want to implement login later)
  // const admin = await prisma.user.upsert(...)

  // Dummy Products
  const products = [
    {
      title: 'Classic Brown Bear',
      slug: 'classic-brown-bear',
      price: 35000,
      description: 'A timeless handmade knitted bear with a warm smile. Perfect for gifts.',
      images: ['/placeholder.svg'], // We will use a placeholder tool or public URL later
      colors: ['Brown', 'Beige'],
      sizes: ['Small', 'Medium'],
      madeToOrder: true,
      leadTimeDays: 7,
      tags: ['bear', 'classic', 'gift'],
    },
    {
      title: 'Mini Keychain Bear',
      slug: 'mini-keychain-bear',
      price: 15000,
      description: 'Cute mini bear to carry around on your bag or keys.',
      images: ['/placeholder.svg'],
      colors: ['White', 'Pink', 'Blue'],
      sizes: ['Mini'],
      madeToOrder: false,
      stock: 20,
      tags: ['keychain', 'mini', 'accessory'],
    },
    {
      title: 'Winter Scarf Bear',
      slug: 'winter-scarf-bear',
      price: 42000,
      description: 'Bear wearing a cozy red scarf. Seasonal special.',
      images: ['/placeholder.svg'],
      colors: ['Brown'],
      sizes: ['Medium'],
      madeToOrder: true,
      leadTimeDays: 5,
      tags: ['winter', 'scarf', 'seasonal'],
    },
    {
      title: 'Baby Blue Bear',
      slug: 'baby-blue-bear',
      price: 38000,
      description: 'Soft baby blue yarn, very gentle touch.',
      images: ['/placeholder.svg'],
      colors: ['Blue'],
      sizes: ['Medium', 'Large'],
      madeToOrder: true,
      leadTimeDays: 7,
      tags: ['pastel', 'blue', 'baby'],
    },
    {
      title: 'Floral Dress Bear',
      slug: 'floral-dress-bear',
      price: 45000,
      description: 'Bear wearing a beautiful handmade floral dress.',
      images: ['/placeholder.svg'],
      colors: ['Beige'],
      sizes: ['Medium'],
      madeToOrder: true,
      leadTimeDays: 10,
      tags: ['dress', 'floral', 'fancy'],
    },
    {
      title: 'Sleepy Bear',
      slug: 'sleepy-bear',
      price: 32000,
      description: 'Bear with closed eyes, ready for bed.',
      images: ['/placeholder.svg'],
      colors: ['Cream'],
      sizes: ['Small'],
      madeToOrder: true,
      leadTimeDays: 7,
      tags: ['sleep', 'cute', 'cream'],
    },
  ]

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    })
    console.log(`Created product with id: ${product.id}`)
  }

  // Policy seed data
  const policies = [
    {
      slug: 'privacy',
      locale: 'ko',
      title: '개인정보처리방침',
      intro: '누나곰은 고객님의 개인정보를 소중하게 생각합니다.',
      sections: [
        {
          title: '수집하는 개인정보 항목',
          content: '주문 또는 문의 시 제공해주시는 정보(성함, 연락처, 주소, 메시지 내용 등)를 수집합니다.'
        },
        {
          title: '개인정보의 이용 목적',
          content: '수집된 정보는 주문 이행 및 문의 응대를 위해서만 사용되며, 배송을 위한 택배사 제공 외에는 제3자에게 제공되지 않습니다.'
        }
      ]
    },
    {
      slug: 'privacy',
      locale: 'en',
      title: 'Privacy Policy',
      intro: 'Your privacy is important to us. This policy outlines how we handle your personal information.',
      sections: [
        {
          title: 'Information We Collect',
          content: 'We collect information you provide directly to us when you place an order or send an inquiry. This includes your name, phone number, address, and any messages.'
        },
        {
          title: 'How We Use Information',
          content: 'We use your information strictly to fulfill your orders and respond to your inquiries. We do not share your information with third parties except for shipping partners to deliver your order.'
        }
      ]
    },
    {
      slug: 'shipping',
      locale: 'ko',
      title: '배송 및 교환/환불 정책',
      intro: null,
      sections: [
        {
          title: '배송 안내',
          content: '모든 상품은 등기/택배로 안전하게 배송됩니다.\n기본 배송비는 3,000원이며, 10만원 이상 구매 시 무료배송입니다.\n• 재고 상품: 주문 후 1-2일 이내 발송\n• 주문제작 상품: 제작 기간 5-10일 소요 후 발송'
        },
        {
          title: '교환 및 환불 안내',
          content: '핸드메이드 제품 특성상 단순 변심에 의한 교환/환불은 어렵습니다.\n상품 불량의 경우 수령 후 3일 이내 연락 주시면 처리를 도와드립니다.\n주문제작 상품은 교환/환불이 불가능합니다.'
        }
      ]
    },
    {
      slug: 'shipping',
      locale: 'en',
      title: 'Shipping & Returns',
      intro: null,
      sections: [
        {
          title: 'Shipping Information',
          content: 'We ship all orders via traceable courier service.\nStandard shipping fee is 3,000 KRW. Free shipping on orders over 100,000 KRW.\n• Ready-made items: Dispatched within 1-2 business days.\n• Made-to-order items: Please allow 5-10 business days for crafting before dispatch.'
        },
        {
          title: 'Returns & Exchanges',
          content: 'Due to the handmade nature of our products, we generally do not accept returns unless the item is defective.\nIf you receive a defective item, please contact us within 3 days of receipt.\nCustom-made items cannot be returned or exchanged.'
        }
      ]
    }
  ]

  for (const p of policies) {
    const policy = await prisma.policy.upsert({
      where: { slug_locale: { slug: p.slug, locale: p.locale } },
      update: {},
      create: p,
    })
    console.log(`Created/found policy: ${policy.slug}-${policy.locale}`)
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
