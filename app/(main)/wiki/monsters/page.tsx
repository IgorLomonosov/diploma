'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Button } from '@/components/ui/button'

interface Monster {
  _id: string
  slug: string
  name_en: string
  name_uk: string
  size: string
  type: string
  type_uk: string
  alignment: string
  challenge_rating: string
  hit_points: number
  armor_class: number
  document_title: string
}

interface Pagination {
  page: number
  pages: number
  total: number
}

const CR_OPTIONS = [
  '0',
  '1/8',
  '1/4',
  '1/2',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
]

const SIZE_OPTIONS = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan']

export default function MonstersPage() {
  const [monsters, setMonsters] = useState<Monster[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cr, setCr] = useState('')
  const [size, setSize] = useState('')
  const [page, setPage] = useState(1)

  const fetchMonsters = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '21')
      if (search) params.set('search', search)
      if (cr && cr !== 'all') params.set('cr', cr)
      if (size && size !== 'all') params.set('size', size)

      const res = await fetch(`/api/monsters?${params}`)
      const data = await res.json()
      setMonsters(data.data)
      setPagination(data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search, cr, size])

  useEffect(() => {
    const timeout = setTimeout(fetchMonsters, 300)
    return () => clearTimeout(timeout)
  }, [fetchMonsters])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleFilter = (type: 'cr' | 'size', value: string) => {
    if (type === 'cr') setCr(value)
    if (type === 'size') setSize(value)
    setPage(1)
  }

  const capitalize = (str: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ''

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Бестіарій</h1>
        <p className="text-muted-foreground mt-1">
          {pagination?.total ?? '...'} монстрів у базі
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Пошук монстра..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <select
          onChange={(e) => handleFilter('cr', e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm sm:w-40"
        >
          <option value="all">Всі CR</option>
          {CR_OPTIONS.map((c) => (
            <option key={c} value={c}>
              CR {c}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => handleFilter('size', e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm sm:w-40"
        >
          <option value="all">Всі розміри</option>
          {SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monsters.map((monster) => (
              <Link key={monster._id} href={`/wiki/monsters/${monster.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {monster.name_uk || monster.name_en}
                    </CardTitle>
                    {monster.name_uk && (
                      <p className="text-sm text-muted-foreground">
                        {monster.name_en}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary">
                        {capitalize(monster.size)}
                      </Badge>
                      <Badge variant="secondary">
                        {monster.type_uk || capitalize(monster.type)}
                      </Badge>
                      <Badge>CR {monster.challenge_rating}</Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>ПЗ: {monster.hit_points}</span>
                      <span>КО: {monster.armor_class}</span>
                    </div>
                    {monster.document_title && (
                      <p className="text-xs text-muted-foreground truncate">
                        📖 {monster.document_title}
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
