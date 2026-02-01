'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { loginAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button className="w-full" disabled={pending}>
            {pending ? 'Logging in...' : 'Login'}
        </Button>
    )
}

export default function LoginPage() {
    const [state, action] = useFormState(loginAction, undefined)

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">Admin Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={action} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" required placeholder="admin@nunagom.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>

                        {state?.error && (
                            <p className="text-sm font-medium text-destructive text-center">
                                {state.error}
                            </p>
                        )}

                        <SubmitButton />
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
