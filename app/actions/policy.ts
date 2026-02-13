'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'

export async function updatePolicy(slug: string, locale: string, formData: FormData) {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const title = formData.get('title') as string
  const intro = (formData.get('intro') as string) || null
  const sectionsJson = formData.get('sections') as string
  const sections = JSON.parse(sectionsJson)

  await prisma.policy.upsert({
    where: { slug_locale: { slug, locale } },
    update: { title, intro, sections },
    create: { slug, locale, title, intro, sections },
  })

  revalidatePath(`/policy/${slug}`)
  revalidatePath('/admin/policies')
  revalidatePath(`/admin/policies/${slug}`)

  return { success: true }
}
