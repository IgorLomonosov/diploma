'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { t } from '@/lib/utils/translations'

interface Monster {
  _id: string
  slug: string
  name_en: string
  name_uk: string
  size: string
  type: string
  type_uk: string
  alignment: string
  challenge_rating: string
  hit_points: number
  armor_class: number
  document_title: string
  img_main: string
}

const CR_OPTIONS = [
  '0',
  '1/8',
  '1/4',
  '1/2',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
]
const SIZE_OPTIONS = [
  { value: 'Tiny', label: 'Крихітний' },
  { value: 'Small', label: 'Малий' },
  { value: 'Medium', label: 'Середній' },
  { value: 'Large', label: 'Великий' },
  { value: 'Huge', label: 'Величезний' },
  { value: 'Gargantuan', label: 'Жахливий' },
]
const selectClass =
  'h-9 rounded-md border border-slate-700 bg-slate-800 text-slate-200 px-3 text-sm'

export default function MonstersPage() {
  const [monsters, setMonsters] = useState<Monster[]>([])
  const [pagination, setPagination] = useState<{
    pages: number
    total: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cr, setCr] = useState('')
  const [size, setSize] = useState('')
  const [page, setPage] = useState(1)

  const fetchMonsters = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '21' })
      if (search) params.set('search', search)
      if (cr && cr !== 'all') params.set('cr', cr)
      if (size && size !== 'all') params.set('size', size)
      const res = await fetch(`/api/monsters?${params}`)
      const data = await res.json()
      setMonsters(data.data)
      setPagination(data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search, cr, size])

  useEffect(() => {
    const timeout = setTimeout(fetchMonsters, 300)
    return () => clearTimeout(timeout)
  }, [fetchMonsters])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Бестіарій</h1>
        <p className="text-slate-400 mt-1">
          {pagination?.total ?? '...'} монстрів у базі
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Пошук монстра..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="sm:max-w-xs bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
        />
        <select
          value={cr}
          onChange={(e) => {
            setCr(e.target.value)
            setPage(1)
          }}
          className={selectClass}
        >
          <option value="all">Всі CR</option>
          {CR_OPTIONS.map((c) => (
            <option key={c} value={c}>
              CR {c}
            </option>
          ))}
        </select>
        <select
          value={size}
          onChange={(e) => {
            setSize(e.target.value)
            setPage(1)
          }}
          className={selectClass}
        >
          <option value="all">Всі розміри</option>
          {SIZE_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-36 rounded-xl bg-slate-800/50 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monsters.map((monster) => (
              <Link key={monster._id} href={`/wiki/monsters/${monster.slug}`}>
                <div className="group p-4 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 hover:border-red-800 transition-all cursor-pointer h-full">
                  <div className="flex gap-3 mb-2">
                    {monster.img_main && (
                      <img
                        src={monster.img_main}
                        alt={monster.name_uk || monster.name_en}
                        className="w-14 h-14 object-contain rounded-lg border border-slate-700 bg-slate-800/50 p-0.5 shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-white group-hover:text-red-400 transition-colors">
                        {monster.name_uk || monster.name_en}
                      </p>
                      {monster.name_uk && (
                        <p className="text-sm text-slate-500">
                          {monster.name_en}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      {t.size(monster.size)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      {t.type(monster.type, monster.type_uk)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/60 text-red-300 font-medium">
                      CR {monster.challenge_rating}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-slate-400">
                    <span>ПЗ: {monster.hit_points}</span>
                    <span>КО: {monster.armor_class}</span>
                  </div>
                  {monster.document_title && (
                    <p className="text-xs text-slate-600 mt-1 truncate">
                      {monster.document_title}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-1.5 text-sm rounded-md border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                Назад
              </button>
              <span className="text-sm text-slate-500">
                {page} / {pagination.pages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
                disabled={page === pagination.pages}
                className="px-4 py-1.5 text-sm rounded-md border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                Далі
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
