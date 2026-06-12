import Link from 'next/link'
import { auth } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/card'
import connectDB from '@/lib/db/mongoose'
import Monster from '@/lib/db/models/Monster'
import Spell from '@/lib/db/models/Spell'
import Race from '@/lib/db/models/Race'
import Class from '@/lib/db/models/Class'
import Background from '@/lib/db/models/Background'
import Feat from '@/lib/db/models/Feat'
import MagicItem from '@/lib/db/models/MagicItem'

const WIKI_LINKS = [
  {
    href: '/wiki/monsters',
    icon: '👹',
    label: 'Бестіарій',
    desc: 'Монстри та істоти',
  },
  {
    href: '/wiki/spells',
    icon: '✨',
    label: 'Заклинання',
    desc: 'Магічні ефекти',
  },
  { href: '/wiki/races', icon: '🧝', label: 'Раси', desc: 'Народи світу' },
  { href: '/wiki/classes', icon: '⚔️', label: 'Класи', desc: 'Шляхи героя' },
  {
    href: '/wiki/backgrounds',
    icon: '📜',
    label: 'Передісторії',
    desc: 'Минуле персонажа',
  },
  {
    href: '/wiki/magic-items',
    icon: '💎',
    label: 'Магічні предмети',
    desc: 'Артефакти та зброя',
  },
  {
    href: '/wiki/feats',
    icon: '🌟',
    label: 'Здібності',
    desc: 'Особливі вміння',
  },
  {
    href: '/wiki/conditions',
    icon: '⚠️',
    label: 'Стани',
    desc: 'Ігрові стани',
  },
  {
    href: '/wiki/equipment',
    icon: '⚔️',
    label: 'Спорядження',
    desc: 'Зброя та обладунки',
  },
  {
    href: '/wiki/sections',
    icon: '📖',
    label: 'Правила',
    desc: 'Правила гри',
  },
]

const TOOL_LINKS = [
  {
    href: '/character',
    icon: '🧙',
    label: 'Персонажі',
    desc: 'Аркуші персонажів',
  },
  {
    href: '/encounter',
    icon: '🗡️',
    label: 'Encounter Builder',
    desc: 'Управління боєм',
  },
  { href: '/dice', icon: '🎲', label: 'Дайси', desc: 'Кидки кубиків' },
  {
    href: '/chat',
    icon: '🤖',
    label: 'AI Асистент',
    desc: 'Відповіді на питання',
  },
]

export default async function DashboardPage() {
  const session = await auth()

  await connectDB()
  const [monsters, spells, races, classes, backgrounds, feats, items] =
    await Promise.all([
      Monster.countDocuments(),
      Spell.countDocuments(),
      Race.countDocuments(),
      Class.countDocuments(),
      Background.countDocuments(),
      Feat.countDocuments(),
      MagicItem.countDocuments(),
    ])

  const total =
    monsters + spells + races + classes + backgrounds + feats + items

  const stats = [
    { label: 'Монстри', count: monsters, icon: '👹' },
    { label: 'Заклинання', count: spells, icon: '✨' },
    { label: 'Раси', count: races, icon: '🧝' },
    { label: 'Класи', count: classes, icon: '⚔️' },
    { label: 'Передісторії', count: backgrounds, icon: '📜' },
    { label: 'Здібності', count: feats, icon: '🌟' },
    { label: 'Предмети', count: items, icon: '💎' },
  ]

  return (
    <div className="space-y-10">
      {/* Банер */}
      <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-red-500 via-transparent to-transparent" />
        <div className="relative">
          <p className="text-slate-400 text-sm mb-1">Вітаємо у</p>
          <h1 className="text-4xl font-bold mb-2">Гримуарі Дракона 🐉</h1>
          <p className="text-slate-300">
            Привіт,{' '}
            <span className="text-white font-semibold">
              {session?.user?.name}
            </span>
            ! У базі зберігається{' '}
            <span className="text-red-400 font-bold">
              {total.toLocaleString()}
            </span>{' '}
            записів про світ D&D.
          </p>
        </div>
      </div>

      {/* Статистика */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          База знань
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
          {stats.map((s) => (
            <Card
              key={s.label}
              className="text-center hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-4 pb-4">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-xl font-bold">
                  {s.count.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {s.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Wiki */}
      <div>
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          📚 Вікі
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {WIKI_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer h-full">
                <CardContent className="pt-4 pb-4 text-center">
                  <div className="text-3xl mb-2">{link.icon}</div>
                  <div className="font-medium text-sm">{link.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {link.desc}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Інструменти */}
      <div>
        <h2 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          🛠️ Інструменти
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TOOL_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer h-full">
                <CardContent className="pt-5 pb-5 text-center">
                  <div className="text-3xl mb-2">{link.icon}</div>
                  <div className="font-medium">{link.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {link.desc}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
