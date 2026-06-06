import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold">
              D&D Platform
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/wiki/monsters"
                className="text-sm hover:text-primary transition-colors"
              >
                Бестіарій
              </Link>
              <Link
                href="/wiki/spells"
                className="text-sm hover:text-primary transition-colors"
              >
                Заклинання
              </Link>
              <Link
                href="/wiki/races"
                className="text-sm hover:text-primary transition-colors"
              >
                Раси
              </Link>
              <Link
                href="/character"
                className="text-sm hover:text-primary transition-colors"
              >
                Персонажі
              </Link>
              <Link
                href="/encounter"
                className="text-sm hover:text-primary transition-colors"
              >
                Encounter Builder
              </Link>
              <Link
                href="/chat"
                className="text-sm hover:text-primary transition-colors"
              >
                AI Асистент
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user.name}
            </span>
            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/login' })
              }}
            >
              <Button variant="outline" size="sm" type="submit">
                Вийти
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
