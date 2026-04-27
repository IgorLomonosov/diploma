import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) redirect('/login')

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Вітаємо, {session.user.name}!</h1>
        <p className="text-muted-foreground">Роль: {session.user.role}</p>
      </div>
    </main>
  )
}
