'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Feat {
  _id: string
  slug: string
  name_en: string
  name_uk: string
  prerequisite: string
  prerequisite_uk: string
  document_title: string
}

export default function FeatsPage() {
  const [feats, setFeats] = useState<Feat[]>([])
  const [pagination, setPagination] = useState<{
    total: number
    pages: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const fetchFeats = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '21')
      if (search) params.set('search', search)
      const res = await fetch(`/api/feats?${params}`)
      const data = await res.json()
      setFeats(data.data)
      setPagination(data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const timeout = setTimeout(fetchFeats, 300)
    return () => clearTimeout(timeout)
  }, [fetchFeats])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Здібності</h1>
        <p className="text-muted-foreground mt-1">
          {pagination?.total ?? '...'} здібностей у базі
        </p>
      </div>
      <Input
        placeholder="Пошук здібності..."
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
            <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feats.map((feat) => (
              <Link key={feat._id} href={`/wiki/feats/${feat.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {feat.name_uk || feat.name_en}
                    </CardTitle>
                    {feat.name_uk && (
                      <p className="text-sm text-muted-foreground">
                        {feat.name_en}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-1">
                    {(feat.prerequisite_uk || feat.prerequisite) && (
                      <p className="truncate">
                        📋 {feat.prerequisite_uk || feat.prerequisite}
                      </p>
                    )}
                    {feat.document_title && (
                      <p className="text-xs truncate">
                        📖 {feat.document_title}
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
