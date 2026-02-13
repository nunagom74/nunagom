'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { ChevronLeft, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import { updatePolicy } from '@/app/actions/policy'
import { toast } from 'sonner'

interface PolicySection {
    title: string
    content: string
}

interface PolicyData {
    id: string
    slug: string
    locale: string
    title: string
    intro: string | null
    sections: unknown
}

interface PolicyFormProps {
    slug: string
    koPolicy: PolicyData | null
    enPolicy: PolicyData | null
    dict: any
    currentLocale: string
}

function parseSections(policy: PolicyData | null): PolicySection[] {
    if (!policy) return [{ title: '', content: '' }]
    const sections = policy.sections as PolicySection[]
    return sections?.length ? sections : [{ title: '', content: '' }]
}

export function PolicyForm({ slug, koPolicy, enPolicy, dict, currentLocale }: PolicyFormProps) {
    const d = dict.admin.policies

    const [koTitle, setKoTitle] = useState(koPolicy?.title || '')
    const [koIntro, setKoIntro] = useState(koPolicy?.intro || '')
    const [koSections, setKoSections] = useState<PolicySection[]>(parseSections(koPolicy))

    const [enTitle, setEnTitle] = useState(enPolicy?.title || '')
    const [enIntro, setEnIntro] = useState(enPolicy?.intro || '')
    const [enSections, setEnSections] = useState<PolicySection[]>(parseSections(enPolicy))

    const [saving, setSaving] = useState(false)

    const getSections = (locale: 'ko' | 'en') => locale === 'ko' ? koSections : enSections
    const setSections = (locale: 'ko' | 'en') => locale === 'ko' ? setKoSections : setEnSections

    const addSection = (locale: 'ko' | 'en') => {
        setSections(locale)(prev => [...prev, { title: '', content: '' }])
    }

    const removeSection = (locale: 'ko' | 'en', index: number) => {
        setSections(locale)(prev => prev.filter((_, i) => i !== index))
    }

    const moveSection = (locale: 'ko' | 'en', index: number, direction: 'up' | 'down') => {
        setSections(locale)(prev => {
            const arr = [...prev]
            const target = direction === 'up' ? index - 1 : index + 1
            if (target < 0 || target >= arr.length) return prev
            ;[arr[index], arr[target]] = [arr[target], arr[index]]
            return arr
        })
    }

    const updateSection = (locale: 'ko' | 'en', index: number, field: 'title' | 'content', value: string) => {
        setSections(locale)(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s))
    }

    const handleSave = async (locale: 'ko' | 'en') => {
        setSaving(true)
        try {
            const title = locale === 'ko' ? koTitle : enTitle
            const intro = locale === 'ko' ? koIntro : enIntro
            const sections = getSections(locale)

            const formData = new FormData()
            formData.set('title', title)
            formData.set('intro', intro)
            formData.set('sections', JSON.stringify(sections))

            const result = await updatePolicy(slug, locale, formData)
            if (result.success) {
                toast.success(d.saved)
            }
        } catch {
            toast.error(d.save_error)
        } finally {
            setSaving(false)
        }
    }

    const policyName = slug === 'privacy' ? d.privacy : d.shipping

    const renderLocaleForm = (locale: 'ko' | 'en') => {
        const title = locale === 'ko' ? koTitle : enTitle
        const setTitle = locale === 'ko' ? setKoTitle : setEnTitle
        const intro = locale === 'ko' ? koIntro : enIntro
        const setIntro = locale === 'ko' ? setKoIntro : setEnIntro
        const sections = getSections(locale)

        return (
            <Card>
                <CardContent className="pt-6 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor={`title-${locale}`}>{d.policy_title}</Label>
                        <Input
                            id={`title-${locale}`}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor={`intro-${locale}`}>{d.intro}</Label>
                        <Textarea
                            id={`intro-${locale}`}
                            value={intro}
                            onChange={(e) => setIntro(e.target.value)}
                            placeholder={d.intro_placeholder}
                            rows={2}
                        />
                    </div>

                    <div className="space-y-4">
                        {sections.map((section, i) => (
                            <div key={i} className="border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {d.section_label} {i + 1}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            disabled={i === 0}
                                            onClick={() => moveSection(locale, i, 'up')}
                                        >
                                            <ArrowUp className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            disabled={i === sections.length - 1}
                                            onClick={() => moveSection(locale, i, 'down')}
                                        >
                                            <ArrowDown className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-destructive hover:text-destructive"
                                            disabled={sections.length <= 1}
                                            onClick={() => removeSection(locale, i)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>{d.section_title}</Label>
                                    <Input
                                        value={section.title}
                                        onChange={(e) => updateSection(locale, i, 'title', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>{d.section_content}</Label>
                                    <Textarea
                                        value={section.content}
                                        onChange={(e) => updateSection(locale, i, 'content', e.target.value)}
                                        placeholder={d.section_content_placeholder}
                                        rows={4}
                                    />
                                </div>
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addSection(locale)}
                            className="w-full"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            {d.add_section}
                        </Button>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={() => handleSave(locale)}
                            disabled={saving}
                        >
                            {saving ? d.saving : d.save}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/policies"><ChevronLeft className="h-4 w-4" /></Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">
                    {policyName}
                </h1>
            </div>

            <Tabs defaultValue={currentLocale}>
                <TabsList>
                    <TabsTrigger value="ko">한국어</TabsTrigger>
                    <TabsTrigger value="en">English</TabsTrigger>
                </TabsList>
                <TabsContent value="ko" className="mt-4">
                    {renderLocaleForm('ko')}
                </TabsContent>
                <TabsContent value="en" className="mt-4">
                    {renderLocaleForm('en')}
                </TabsContent>
            </Tabs>
        </div>
    )
}
