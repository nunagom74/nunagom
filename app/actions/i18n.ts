'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function setLocaleAction(locale: string) {
    const cookieStore = await cookies()
    // Set cookie for 1 year
    cookieStore.set('NEXT_LOCALE', locale, { path: '/', maxAge: 31536000 })
    // Revalidate all pages to reflect language change
    revalidatePath('/', 'layout')
}
