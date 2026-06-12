'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

interface MagicItem {
  _id: string
  slug: string
  name_en: string
  name_uk: string
  type: string
  rarity: string
  rarity_uk: string
  requires_attunement: string
  document_title: string
}

const RARITIES = [
  { value: 'common', label: 'Звичайний' },
  { value: 'uncommon', label: 'Незвичайний' },
  { value: 'rare', label: 'Рідкісний' },
  { value: 'very rare', label: 'Дуже рідкісний' },
  { value: 'legendary', label: 'Легендарний' },
  { value: 'artifact', label: 'Артефакт' },
]

const selectClass =
  'h-9 rounded-md border border-slate-700 bg-slate-800 text-slate-200 px-3 text-sm'

export default function MagicItemsPage() {
  const [items, setItems] = useState<MagicItem[]>([])
  const [pagination, setPagination] = useState<{
    pages: number
    total: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [rarity, setRarity] = useState('')
  const [attunement, setAttunement] = useState('')
  const [page, setPage] = useState(1)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '21' })
      if (search) params.set('search', search)
      if (rarity) params.set('rarity', rarity)
      if (attunement) params.set('attunement', attunement)
      const res = await fetch(`/api/magic-items?${params}`)
      const data = await res.json()
      setItems(data.data)
      setPagination(data.pagination)
    } finally {
      setLoading(false)
    }
  }, [page, search, rarity, attunement])

  useEffect(() => {
    const t = setTimeout(fetchItems, 300)
    return () => clearTimeout(t)
  }, [fetchItems])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Магічні предмети</h1>
        <p className="text-slate-400 mt-1">
          {pagination?.total ?? '...'} предметів у базі
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Пошук предмета..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-xs bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
        />
        <select
          value={rarity}
          onChange={(e) => {
            setRarity(e.target.value)
            setPage(1)
          }}
          className={selectClass}
        >
          <option value="">Всі рідкісності</option>
          {RARITIES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <select
          value={attunement}
          onChange={(e) => {
            setAttunement(e.target.value)
            setPage(1)
          }}
          className={selectClass}
        >
          <option value="">Налаштування: всі</option>
          <option value="yes">Потребує налаштування</option>
          <option value="no">Без налаштування</option>
        </select>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-slate-800/50 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Link key={item._id} href={`/wiki/magic-items/${item.slug}`}>
                <div className="group p-4 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 hover:border-red-800 transition-all cursor-pointer h-full">
                  <p className="font-semibold text-white group-hover:text-red-400 transition-colors mb-1">
                    {item.name_uk || item.name_en}
                  </p>
                  {item.name_uk && (
                    <p className="text-sm text-slate-500 mb-2">
                      {item.name_en}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      {item.type}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      {item.rarity_uk || item.rarity}
                    </span>
                    {item.requires_attunement &&
                      item.requires_attunement !== 'no' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/50 text-red-300">
                          Налаштування
                        </span>
                      )}
                  </div>
                  {item.document_title && (
                    <p className="text-xs text-slate-600 mt-1 truncate">
                      {item.document_title}
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
