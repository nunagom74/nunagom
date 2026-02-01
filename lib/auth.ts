import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

const SECRET_KEY = process.env.SESSION_SECRET || 'default-secret-key'
const key = new TextEncoder().encode(SECRET_KEY)

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key)
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        })
        return payload
    } catch (err) {
        return null
    }
}

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // In a real app, you would fetch user from DB.
    // For this MVP, we match against ENV or DB Admin.
    // We will check Env first for simplicity, or DB if you prefer.
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPass = process.env.ADMIN_PASSWORD

    let isValid = false
    if (email === adminEmail && password === adminPass) {
        isValid = true
    } else {
        // Here we could check DB users
        // const user = await prisma.user.findUnique({ where: { email } })
        // if (user && bcrypt.compareSync(password, user.password)) ...
        // But for MVP per prompt "Simple Admin", Env match is often enough for single user, 
        // BUT prompts said "User(Admin) model". So verifying against DB is better.
        // I will implement DB check in the Server Action later.
        // This is just helper file.
    }
}

export async function getSession() {
    const session = (await cookies()).get('session')?.value
    if (!session) return null
    return await decrypt(session)
}

export async function updateSession() {
    const session = (await cookies()).get('session')?.value
    if (!session) return null

    // Refresh expires
    const parsed = await decrypt(session)
    if (!parsed) return null

    parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const res = new Response() // This is for middleware usually
    // ... middleware context implies different handling
    return parsed
}

export async function createSession(user: { email: string, id: string }) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const session = await encrypt({ user, expires })

    const cookieStore = await cookies()
    cookieStore.set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires,
        sameSite: 'lax',
        path: '/',
    })
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.set('session', '', { expires: new Date(0) })
}
