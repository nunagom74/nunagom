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
