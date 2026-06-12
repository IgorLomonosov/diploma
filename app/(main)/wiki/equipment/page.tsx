'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'

interface Equipment {
  _id: string
  slug: string
  name_en: string
  name_uk: string
  category: string
  damage_dice: string
  damage_type: string
  weapon_range: string
  armor_class: string
  armor_category: string
  cost: string
}

const selectClass =
  'h-9 rounded-md border border-slate-700 bg-slate-800 text-slate-200 px-3 text-sm'

export default function EquipmentPage() {
  const [items, setItems] = useState<Equipment[]>([])
  const [pagination, setPagination] = useState<{
    pages: number
    total: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '21' })
      if (search) params.set('search', search)
      if (category) params.set('category', category)
      const res = await fetch(`/api/equipment?${params}`)
      const data = await res.json()
      setItems(data.data)
      setPagination(data.pagination)
    } finally {
      setLoading(false)
    }
  }, [page, search, category])

  useEffect(() => {
    const t = setTimeout(fetchItems, 300)
    return () => clearTimeout(t)
  }, [fetchItems])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Спорядження</h1>
        <p className="text-slate-400 mt-1">
          {pagination?.total ?? '...'} предметів у базі
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Пошук..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="max-w-xs bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            setPage(1)
          }}
          className={selectClass}
        >
          <option value="">Всі категорії</option>
          <option value="weapon">Зброя</option>
          <option value="armor">Обладунок</option>
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
              <div
                key={item._id}
                className="p-4 rounded-xl border border-slate-700 bg-slate-900/60 h-full"
              >
                <p className="font-semibold text-white mb-1">
                  {item.name_uk || item.name_en}
                </p>
                {item.name_uk && (
                  <p className="text-sm text-slate-500 mb-2">{item.name_en}</p>
                )}
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                    {item.category === 'weapon' ? 'Зброя' : 'Обладунок'}
                  </span>
                  {item.armor_category && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      {item.armor_category}
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-400 space-y-0.5">
                  {item.damage_dice && (
                    <p>
                      ⚔️ {item.damage_dice} {item.damage_type} ·{' '}
                      {item.weapon_range}
                    </p>
                  )}
                  {item.armor_class && <p>🛡️ КО: {item.armor_class}</p>}
                  {item.cost && (
                    <p className="text-slate-500">💰 {item.cost}</p>
                  )}
                </div>
              </div>
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
