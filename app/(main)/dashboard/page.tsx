import Link from 'next/link'
import { auth } from '@/lib/auth'
import connectDB from '@/lib/db/mongoose'
import Monster from '@/lib/db/models/Monster'
import Spell from '@/lib/db/models/Spell'
import Race from '@/lib/db/models/Race'
import Class from '@/lib/db/models/Class'
import Background from '@/lib/db/models/Background'
import Feat from '@/lib/db/models/Feat'
import MagicItem from '@/lib/db/models/MagicItem'
import Condition from '@/lib/db/models/Condition'
import Equipment from '@/lib/db/models/Equipment'
import Section from '@/lib/db/models/Section'

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
    icon: '🛡️',
    label: 'Спорядження',
    desc: 'Зброя та обладунки',
  },
  { href: '/wiki/sections', icon: '📖', label: 'Правила', desc: 'Правила гри' },
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
    label: 'Симуляція Бою',
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

  const [
    monsters,
    spells,
    races,
    classes,
    backgrounds,
    feats,
    items,
    conditions,
    equipment,
    sections,
  ] = await Promise.all([
    Monster.countDocuments(),
    Spell.countDocuments(),
    Race.countDocuments(),
    Class.countDocuments(),
    Background.countDocuments(),
    Feat.countDocuments(),
    MagicItem.countDocuments(),
    Condition.countDocuments(),
    Equipment.countDocuments(),
    Section.countDocuments(),
  ])

  const total =
    monsters +
    spells +
    races +
    classes +
    backgrounds +
    feats +
    items +
    conditions +
    equipment +
    sections

  const stats = [
    { label: 'Монстри', count: monsters },
    { label: 'Заклинання', count: spells },
    { label: 'Раси', count: races },
    { label: 'Класи', count: classes },
    { label: 'Передісторії', count: backgrounds },
    { label: 'Здібності', count: feats },
    { label: 'Предмети', count: items },
    { label: 'Стани', count: conditions },
    { label: 'Спорядження', count: equipment },
    { label: 'Правила', count: sections },
  ]

  return (
    <div className="space-y-10">
      {/* Банер */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900/60 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/30 via-transparent to-transparent" />
        <div className="relative">
          <p className="text-slate-400 text-sm mb-1">Вітаємо у</p>
          <h1 className="text-4xl font-bold text-white mb-2">
            Гримуарі Дракона 🐉
          </h1>
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
        <h2 className="text-xs font-semibold mb-3 text-slate-500 uppercase tracking-widest">
          База знань
        </h2>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="text-center p-3 rounded-lg border border-slate-700 bg-slate-900/50"
            >
              <div className="text-xl font-bold text-white">
                {s.count.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Wiki */}
      <div>
        <h2 className="text-xs font-semibold mb-3 text-slate-500 uppercase tracking-widest">
          Вікі
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {WIKI_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="group p-4 rounded-xl border border-slate-700 bg-slate-900/50 hover:bg-slate-800/80 hover:border-red-800 transition-all cursor-pointer text-center h-full">
                <div className="text-2xl mb-2">{link.icon}</div>
                <div className="font-medium text-sm text-white">
                  {link.label}
                </div>
                <div className="text-xs text-slate-500 mt-1">{link.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Інструменти */}
      <div>
        <h2 className="text-xs font-semibold mb-3 text-slate-500 uppercase tracking-widest">
          Інструменти
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TOOL_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="group p-5 rounded-xl border border-slate-700 bg-slate-900/50 hover:bg-slate-800/80 hover:border-red-800 transition-all cursor-pointer text-center h-full">
                <div className="text-3xl mb-2">{link.icon}</div>
                <div className="font-medium text-white">{link.label}</div>
                <div className="text-xs text-slate-500 mt-1">{link.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
