'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

interface Section {
  _id: string
  slug: string
  name_en: string
  name_uk: string
  parent: string
  document_title: string
}

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [pagination, setPagination] = useState<{
    pages: number
    total: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const fetchSections = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '21' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/sections?${params}`)
      const data = await res.json()
      setSections(data.data)
      setPagination(data.pagination)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const t = setTimeout(fetchSections, 300)
    return () => clearTimeout(t)
  }, [fetchSections])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Правила</h1>
        <p className="text-slate-400 mt-1">
          {pagination?.total ?? '...'} розділів у базі
        </p>
      </div>
      <Input
        placeholder="Пошук розділу..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
        className="max-w-xs bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
      />
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-xl bg-slate-800/50 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sections.map((s) => (
              <Link key={s._id} href={`/wiki/sections/${s.slug}`}>
                <div className="group p-4 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 hover:border-red-800 transition-all cursor-pointer h-full">
                  <p className="font-semibold text-white group-hover:text-red-400 transition-colors mb-1">
                    {s.name_uk || s.name_en}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {s.parent && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                        {s.parent}
                      </span>
                    )}
                    {s.document_title && (
                      <span className="text-xs text-slate-600">
                        {s.document_title}
                      </span>
                    )}
                  </div>
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
