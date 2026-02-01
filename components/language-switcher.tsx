'use client'

import { Button } from '@/components/ui/button'
import { setLocaleAction } from '@/app/actions/i18n'
import { useTransition } from 'react'

export function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
    const [isPending, startTransition] = useTransition()

    const toggleLocale = () => {
        const nextLocale = currentLocale === 'ko' ? 'en' : 'ko'
        startTransition(() => {
            setLocaleAction(nextLocale)
        })
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleLocale}
            disabled={isPending}
            className="font-medium"
        >
            {currentLocale === 'ko' ? 'EN' : 'KR'}
        </Button>
    )
}
