'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { t } from '@/lib/utils/translations'

interface Race {
  _id: string
  slug: string
  name_en: string
  name_uk: string
  size: string
  speed: number
  document_title: string
}

export default function RacesPage() {
  const [races, setRaces] = useState<Race[]>([])
  const [pagination, setPagination] = useState<{
    total: number
    pages: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const fetchRaces = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      if (search) params.set('search', search)
      const res = await fetch(`/api/races?${params}`)
      const data = await res.json()
      setRaces(data.data)
      setPagination(data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const timeout = setTimeout(fetchRaces, 300)
    return () => clearTimeout(timeout)
  }, [fetchRaces])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Раси</h1>
        <p className="text-muted-foreground mt-1">
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
        className="max-w-xs"
      />
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {races.map((race) => (
              <Link key={race._id} href={`/wiki/races/${race.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {race.name_uk || race.name_en}
                    </CardTitle>
                    {race.name_uk && (
                      <p className="text-sm text-muted-foreground">
                        {race.name_en}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">⚡ {race.speed} фут.</Badge>
                    </div>
                    {race.document_title && (
                      <p className="text-xs text-muted-foreground">
                        📖 {race.document_title}
                      </p>
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
