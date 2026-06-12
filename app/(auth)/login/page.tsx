'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { loginAction } from './actions'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError('Заповніть всі поля')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await loginAction(form.email, form.password)
      if (!result.success) {
        setError(result.error || 'Помилка входу')
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Щось пішло не так')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-3">🐉</div>
          <h1 className="text-2xl font-bold text-white">Гримуар Дракона</h1>
          <p className="text-slate-400 text-sm mt-1">
            D&D 5e Інформаційна платформа
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur">
          <CardHeader className="pb-2 pt-6">
            <h2 className="text-lg font-semibold text-white text-center">
              Вхід до системи
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Email</Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Пароль</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
            <Button
              className="w-full bg-red-700 hover:bg-red-600 text-white"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Вхід...' : 'Увійти'}
            </Button>
            <p className="text-center text-sm text-slate-400">
              Немає акаунту?{' '}
              <Link
                href="/register"
                className="text-red-400 hover:text-red-300 underline"
              >
                Зареєструватися
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
