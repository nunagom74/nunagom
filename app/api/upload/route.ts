import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
        return NextResponse.json({ success: false, message: 'No file uploaded' })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure public/uploads exists
    const relativeUploadDir = `/uploads`
    const uploadDir = join(process.cwd(), 'public', relativeUploadDir)

    try {
        await mkdir(uploadDir, { recursive: true })
    } catch (e) {
        // ignore
    }

    const uniqueSuffix = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    const filename = uniqueSuffix
    const filepath = join(uploadDir, filename)

    await writeFile(filepath, buffer)

    const finalUrl = `${relativeUploadDir}/${filename}`

    return NextResponse.json({ success: true, url: finalUrl })
}
