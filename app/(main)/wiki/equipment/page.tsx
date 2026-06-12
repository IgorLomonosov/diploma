'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Equipment {
  _id: string
  slug: string
  name_en: string
  name_uk: string
  category: string
  armor_category: string
  damage_dice: string
  damage_type: string
  weapon_range: string
  armor_class: string
  cost: string
}

const CATEGORY_LABELS: Record<string, string> = {
  weapon: '⚔️ Зброя',
  armor: '🛡️ Обладунок',
}

export default function EquipmentPage() {
  const [items, setItems] = useState<Equipment[]>([])
  const [pagination, setPagination] = useState<{
    total: number
    pages: number
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
    } catch (err) {
      console.error(err)
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
        <h1 className="text-3xl font-bold">Спорядження</h1>
        <p className="text-muted-foreground mt-1">
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
          className="max-w-xs"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value)
            setPage(1)
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Всі категорії</option>
          <option value="weapon">⚔️ Зброя</option>
          <option value="armor">🛡️ Обладунок</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card
                key={item._id}
                className="hover:shadow-md transition-shadow h-full"
              >
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
                <CardContent className="text-sm space-y-1.5">
                  <Badge variant="outline">
                    {CATEGORY_LABELS[item.category] || item.category}
                  </Badge>
                  {item.damage_dice && (
                    <p>
                      ⚔️ {item.damage_dice} {item.damage_type} ·{' '}
                      {item.weapon_range}
                    </p>
                  )}
                  {item.armor_class && <p>🛡️ КО: {item.armor_class}</p>}
                  {item.cost && (
                    <p className="text-muted-foreground">💰 {item.cost}</p>
                  )}
                </CardContent>
              </Card>
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
