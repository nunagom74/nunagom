import { getDictionary } from '@/lib/i18n'
import Image from 'next/image'

export default async function AboutPage() {
    const dict = await getDictionary()

    return (
        <div className="container mx-auto px-4 py-16 max-w-2xl text-center space-y-12">
            <div className="space-y-4">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary">
                    {dict.about.title}
                </h1>
                <p className="text-xl text-muted-foreground font-medium">
                    {dict.about.subtitle}
                </p>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-muted">
                <img
                    src="/brand-image.jpg"
                    alt="Nuna Gom Brand Story"
                    className="object-cover w-full h-full"
                />
            </div>

            <div className="space-y-6 text-lg leading-relaxed text-muted-foreground text-left md:text-center break-keep">
                <p>{dict.about.p1}</p>
                <p>{dict.about.p2}</p>
                <p>{dict.about.p3}</p>
            </div>

            <div className="pt-8 font-serif italic text-primary text-xl">
                {dict.about.signature}
            </div>
        </div>
    )
}
