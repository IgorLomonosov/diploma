'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Class {
  _id: string
  slug: string
  name_en: string
  name_uk: string
  hit_dice: string
  document_title: string
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [pagination, setPagination] = useState<{
    total: number
    pages: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      if (search) params.set('search', search)
      const res = await fetch(`/api/classes?${params}`)
      const data = await res.json()
      setClasses(data.data)
      setPagination(data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const timeout = setTimeout(fetchClasses, 300)
    return () => clearTimeout(timeout)
  }, [fetchClasses])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Класи</h1>
        <p className="text-muted-foreground mt-1">
          {pagination?.total ?? '...'} класів у базі
        </p>
      </div>
      <Input
        placeholder="Пошук класу..."
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
            {classes.map((cls) => (
              <Link key={cls._id} href={`/wiki/classes/${cls.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {cls.name_uk || cls.name_en}
                    </CardTitle>
                    {cls.name_uk && (
                      <p className="text-sm text-muted-foreground">
                        {cls.name_en}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {cls.hit_dice && (
                      <Badge variant="secondary">
                        Кістки ПЗ: {cls.hit_dice}
                      </Badge>
                    )}
                    {cls.document_title && (
                      <p className="text-xs text-muted-foreground">
                        📖 {cls.document_title}
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
