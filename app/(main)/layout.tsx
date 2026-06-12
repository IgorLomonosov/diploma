import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth'

const WIKI_LINKS = [
  { href: '/wiki/monsters', icon: '👹', label: 'Бестіарій' },
  { href: '/wiki/spells', icon: '✨', label: 'Заклинання' },
  { href: '/wiki/races', icon: '🧝', label: 'Раси' },
  { href: '/wiki/classes', icon: '⚔️', label: 'Класи' },
  { href: '/wiki/backgrounds', icon: '📜', label: 'Передісторії' },
  { href: '/wiki/magic-items', icon: '💎', label: 'Предмети' },
  { href: '/wiki/feats', icon: '🌟', label: 'Здібності' },
]

const TOOL_LINKS = [
  { href: '/character', icon: '🧙', label: 'Персонажі' },
  { href: '/encounter', icon: '🗡️', label: 'Encounter' },
  { href: '/dice', icon: '🎲', label: 'Дайси' },
  { href: '/chat', icon: '🤖', label: 'AI Асистент' },
]

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Логотип */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-lg shrink-0 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">🐉</span>
            <span className="hidden sm:block">Гримуар Дракона</span>
          </Link>

          {/* Навігація — desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Wiki dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors">
                📚 Вікі
                <svg
                  className="w-3 h-3 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 rounded-md border border-border bg-white text-popover-foreground shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="py-1">
                  {WIKI_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <span>{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Tools dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors">
                🛠️ Інструменти
                <svg
                  className="w-3 h-3 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-1 w-48 rounded-md border border-border bg-white text-popover-foreground shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="py-1">
                  {TOOL_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <span>{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Права частина */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:block text-sm text-muted-foreground">
              {session.user.name}
            </span>
            {(session.user as any).role === 'moderator' && (
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  ⚙️ Адмін
                </Button>
              </Link>
            )}
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

        {/* Мобільна навігація */}
        <div className="lg:hidden border-t overflow-x-auto">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 py-2 w-max">
              {[...WIKI_LINKS, ...TOOL_LINKS].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 text-sm whitespace-nowrap text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      <footer className="border-t py-4">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          Гримуар Дракона · D&D 5e Інформаційна платформа · Контент надано{' '}
          <a
            href="https://open5e.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Open5e
          </a>
        </div>
      </footer>
    </div>
  )
}
