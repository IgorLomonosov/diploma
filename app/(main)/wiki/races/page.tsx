'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

interface Race {
  _id: string
  slug: string
  name_en: string
  name_uk: string
  size: string
  speed: number
  document_title: string
}

const selectClass =
  'h-9 rounded-md border border-slate-700 bg-slate-800 text-slate-200 px-3 text-sm'

export default function RacesPage() {
  const [races, setRaces] = useState<Race[]>([])
  const [pagination, setPagination] = useState<{
    pages: number
    total: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const fetchRaces = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '21' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/races?${params}`)
      const data = await res.json()
      setRaces(data.data)
      setPagination(data.pagination)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const t = setTimeout(fetchRaces, 300)
    return () => clearTimeout(t)
  }, [fetchRaces])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Раси</h1>
        <p className="text-slate-400 mt-1">
          {pagination?.total ?? '...'} рас у базі
        </p>
      </div>
      <Input
        placeholder="Пошук раси..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
        className="max-w-xs bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
      />
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
            {races.map((race) => (
              <Link key={race._id} href={`/wiki/races/${race.slug}`}>
                <div className="group p-4 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 hover:border-red-800 transition-all cursor-pointer h-full">
                  <p className="font-semibold text-white group-hover:text-red-400 transition-colors mb-1">
                    {race.name_uk || race.name_en}
                  </p>
                  {race.name_uk && (
                    <p className="text-sm text-slate-500 mb-2">
                      {race.name_en}
                    </p>
                  )}
                  <div className="flex gap-3 text-sm text-slate-400">
                    {race.speed && <span>Швидкість: {race.speed} фут.</span>}
                  </div>
                  {race.document_title && (
                    <p className="text-xs text-slate-600 mt-1 truncate">
                      {race.document_title}
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
