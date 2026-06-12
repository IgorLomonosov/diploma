import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth'

const WIKI_LINKS = [
  { href: '/wiki/monsters', label: 'Бестіарій' },
  { href: '/wiki/spells', label: 'Заклинання' },
  { href: '/wiki/races', label: 'Раси' },
  { href: '/wiki/classes', label: 'Класи' },
  { href: '/wiki/backgrounds', label: 'Передісторії' },
  { href: '/wiki/magic-items', label: 'Предмети' },
  { href: '/wiki/feats', label: 'Здібності' },
  { href: '/wiki/conditions', label: 'Стани' },
  { href: '/wiki/equipment', label: 'Спорядження' },
  { href: '/wiki/sections', label: 'Правила' },
]

const TOOL_LINKS = [
  { href: '/character', label: 'Персонажі' },
  { href: '/encounter', label: 'Симуляція Бою' },
  { href: '/dice', label: 'Дайси' },
  { href: '/chat', label: 'AI Асистент' },
]

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-lg shrink-0 hover:opacity-80 transition-opacity text-white"
          >
            <span className="text-2xl">🐉</span>
            <span className="hidden sm:block">Гримуар Дракона</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-2 text-sm rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                Вікі
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
              <div className="absolute top-full left-0 mt-1 w-48 rounded-md border border-slate-700 bg-slate-900 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="py-1">
                  {WIKI_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative group">
              <button className="flex items-center gap-1 px-3 py-2 text-sm rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                Інструменти
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
              <div className="absolute top-full left-0 mt-1 w-48 rounded-md border border-slate-700 bg-slate-900 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="py-1">
                  {TOOL_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:block text-sm text-slate-400">
              {session.user.name}
            </span>
            {(session.user as any).role === 'moderator' && (
              <Link href="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Адмін
                </Button>
              </Link>
            )}
            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/login' })
              }}
            >
              <Button
                variant="outline"
                size="sm"
                type="submit"
                className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Вийти
              </Button>
            </form>
          </div>
        </div>

        <div className="lg:hidden border-t border-slate-800 overflow-x-auto">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4 py-2 w-max">
              {[...WIKI_LINKS, ...TOOL_LINKS].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm whitespace-nowrap text-slate-400 hover:text-white transition-colors py-1"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      <footer className="border-t border-slate-800 py-4">
        <div className="container mx-auto px-4 text-center text-xs text-slate-500">
          Гримуар Дракона · D&D 5e Інформаційна платформа · Контент надано{' '}
          <a
            href="https://open5e.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-300"
          >
            Open5e
          </a>
        </div>
      </footer>
    </div>
  )
}
