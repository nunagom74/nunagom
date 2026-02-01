'use server'

import { createSession, logout } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

export async function loginAction(prevState: any, formData: FormData) {
    const result = LoginSchema.safeParse(Object.fromEntries(formData))

    if (!result.success) {
        return { error: 'Invalid email or password' }
    }

    const { email, password } = result.data

    // Check Env First (Simple Admin)
    const envEmail = process.env.ADMIN_EMAIL
    const envPass = process.env.ADMIN_PASSWORD

    if (email === envEmail && password === envPass) {
        await createSession({ email, id: 'admin-env' })
        redirect('/admin')
    }

    // Fallback to DB check
    try {
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || user.role !== 'ADMIN') {
            return { error: 'Invalid credentials' }
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return { error: 'Invalid credentials' }
        }

        await createSession({ email: user.email, id: user.id })
    } catch (err) {
        return { error: 'Authentication failed' }
    }

    redirect('/admin')
}

export async function logoutAction() {
    await logout()
    redirect('/admin/login')
}
