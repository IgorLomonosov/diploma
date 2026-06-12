'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

interface Spell {
  _id: string
  slug: string
  name_en: string
  name_uk: string
  level: number
  school: string
  school_uk: string
  casting_time: string
  casting_time_uk: string
  range: string
  document_title: string
}

const SCHOOLS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
]
const LEVELS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
const selectClass =
  'h-9 rounded-md border border-slate-700 bg-slate-800 text-slate-200 px-3 text-sm'

export default function SpellsPage() {
  const [spells, setSpells] = useState<Spell[]>([])
  const [pagination, setPagination] = useState<{
    pages: number
    total: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('')
  const [school, setSchool] = useState('')
  const [page, setPage] = useState(1)

  const fetchSpells = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '21' })
      if (search) params.set('search', search)
      if (level) params.set('level', level)
      if (school) params.set('school', school)
      const res = await fetch(`/api/spells?${params}`)
      const data = await res.json()
      setSpells(data.data)
      setPagination(data.pagination)
    } finally {
      setLoading(false)
    }
  }, [page, search, level, school])

  useEffect(() => {
    const t = setTimeout(fetchSpells, 300)
    return () => clearTimeout(t)
  }, [fetchSpells])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Заклинання</h1>
        <p className="text-slate-400 mt-1">
          {pagination?.total ?? '...'} заклинань у базі
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Пошук заклинання..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-xs bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
        />
        <select
          value={level}
          onChange={(e) => {
            setLevel(e.target.value)
            setPage(1)
          }}
          className={selectClass}
        >
          <option value="">Всі рівні</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l === '0' ? 'Заговір' : `${l} рівень`}
            </option>
          ))}
        </select>
        <select
          value={school}
          onChange={(e) => {
            setSchool(e.target.value)
            setPage(1)
          }}
          className={selectClass}
        >
          <option value="">Всі школи</option>
          {SCHOOLS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-slate-800/50 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {spells.map((spell) => (
              <Link key={spell._id} href={`/wiki/spells/${spell.slug}`}>
                <div className="group p-4 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 hover:border-red-800 transition-all cursor-pointer h-full">
                  <p className="font-semibold text-white group-hover:text-red-400 transition-colors mb-1">
                    {spell.name_uk || spell.name_en}
                  </p>
                  {spell.name_uk && (
                    <p className="text-sm text-slate-500 mb-2">
                      {spell.name_en}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      {spell.level === 0 ? 'Заговір' : `${spell.level} рівень`}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      {spell.school_uk || spell.school}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">
                    {spell.casting_time_uk || spell.casting_time}
                  </p>
                  {spell.document_title && (
                    <p className="text-xs text-slate-600 mt-1 truncate">
                      {spell.document_title}
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
