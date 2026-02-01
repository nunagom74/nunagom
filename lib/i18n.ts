import 'server-only'
import { cookies } from 'next/headers'

// Type definition for the dictionary
export type Dictionary = typeof import('@/messages/en.json')

const dictionaries = {
    en: () => import('@/messages/en.json').then((module) => module.default),
    ko: () => import('@/messages/ko.json').then((module) => module.default),
}

export type Locale = keyof typeof dictionaries

export async function getLocale(): Promise<Locale> {
    const cookieStore = cookies()
    const locale = (await cookieStore).get('NEXT_LOCALE')?.value as Locale

    if (!locale || !dictionaries[locale]) {
        return 'ko' // Default to Korean
    }

    return locale
}

export async function getDictionary(): Promise<Dictionary> {
    const locale = await getLocale()
    return dictionaries[locale]()
}
