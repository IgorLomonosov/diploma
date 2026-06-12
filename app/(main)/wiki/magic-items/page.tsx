'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface MagicItem {
  _id: string
  slug: string
  name_en: string
  name_uk: string
  type: string
  type_uk: string
  rarity: string
  rarity_uk: string
  requires_attunement: string
  document_title: string
}

const RARITY_OPTIONS = [
  'common',
  'uncommon',
  'rare',
  'very rare',
  'legendary',
  'artifact',
]
const RARITY_UK: Record<string, string> = {
  common: 'Звичайний',
  uncommon: 'Незвичайний',
  rare: 'Рідкісний',
  'very rare': 'Дуже рідкісний',
  legendary: 'Легендарний',
  artifact: 'Артефакт',
}

const rarityColor: Record<string, string> = {
  common: '',
  uncommon: 'text-green-600',
  rare: 'text-blue-600',
  'very rare': 'text-purple-600',
  legendary: 'text-orange-500',
  artifact: 'text-red-600',
}

export default function MagicItemsPage() {
  const [items, setItems] = useState<MagicItem[]>([])
  const [pagination, setPagination] = useState<{
    total: number
    pages: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [rarity, setRarity] = useState('')
  const [page, setPage] = useState(1)
  const [attunement, setAttunement] = useState('')

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '21')
      if (search) params.set('search', search)
      if (rarity && rarity !== 'all') params.set('rarity', rarity)
      if (attunement === 'yes') params.set('attunement', 'yes')
      if (attunement === 'no') params.set('attunement', 'no')
      const res = await fetch(`/api/magic-items?${params}`)
      const data = await res.json()
      setItems(data.data)
      setPagination(data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search, rarity, attunement])

  useEffect(() => {
    const timeout = setTimeout(fetchItems, 300)
    return () => clearTimeout(timeout)
  }, [fetchItems])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Магічні предмети</h1>
        <p className="text-muted-foreground mt-1">
          {pagination?.total ?? '...'} предметів у базі
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Пошук предмета..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="sm:max-w-xs"
        />
        <select
          onChange={(e) => {
            setRarity(e.target.value)
            setPage(1)
          }}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm sm:w-44"
        >
          <option value="all">Всі рідкісності</option>
          {RARITY_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {RARITY_UK[r] || r}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => {
            setAttunement(e.target.value)
            setPage(1)
          }}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm sm:w-44"
        >
          <option value="">Налаштування: всі</option>
          <option value="yes">Потребує налаштування</option>
          <option value="no">Без налаштування</option>
        </select>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Link key={item._id} href={`/wiki/magic-items/${item.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {item.name_uk || item.name_en}
                    </CardTitle>
                    {item.name_uk && (
                      <p className="text-sm text-muted-foreground">
                        {item.name_en}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {(item.type_uk || item.type) && (
                        <Badge variant="secondary">
                          {item.type_uk || item.type}
                        </Badge>
                      )}
                      {(item.rarity_uk || item.rarity) && (
                        <Badge
                          variant="outline"
                          className={
                            rarityColor[item.rarity?.toLowerCase()] || ''
                          }
                        >
                          {item.rarity_uk ||
                            RARITY_UK[item.rarity?.toLowerCase()] ||
                            item.rarity}
                        </Badge>
                      )}
                      {item.requires_attunement &&
                        item.requires_attunement !== 'no' && (
                          <Badge variant="outline">Налаштування</Badge>
                        )}
                    </div>
                    {item.document_title && (
                      <p className="text-xs text-muted-foreground truncate">
                        📖 {item.document_title}
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
