'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
    total: number
    pages: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const fetchSections = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/sections?${params}`)
      const data = await res.json()
      setSections(data.data)
      setPagination(data.pagination)
    } catch (err) {
      console.error(err)
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
        <h1 className="text-3xl font-bold">Правила</h1>
        <p className="text-muted-foreground mt-1">
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
        className="max-w-xs"
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sections.map((s) => (
              <Link key={s._id} href={`/wiki/sections/${s.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-1 pt-4">
                    <CardTitle className="text-base">
                      {s.name_uk || s.name_en}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-3 flex gap-2 flex-wrap">
                    {s.parent && (
                      <Badge variant="secondary" className="text-xs">
                        {s.parent}
                      </Badge>
                    )}
                    {s.document_title && (
                      <Badge variant="outline" className="text-xs">
                        📖 {s.document_title}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Назад
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
                disabled={page === pagination.pages}
              >
                Далі
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
