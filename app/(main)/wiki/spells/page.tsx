'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { t } from '@/lib/utils/translations'

interface Spell {
  _id: string
  slug: string
  name_en: string
  name_uk: string
  level: number
  school: string
  school_uk: string
  casting_time: string
  casting_time_uk: string
  range: string
  range_uk: string
  duration: string
  duration_uk: string
  concentration: boolean
  ritual: boolean
  classes: string[]
  document_title: string
}

interface Pagination {
  page: number
  pages: number
  total: number
}

const LEVEL_OPTIONS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

const SCHOOL_OPTIONS = [
  'abjuration',
  'conjuration',
  'divination',
  'enchantment',
  'evocation',
  'illusion',
  'necromancy',
  'transmutation',
]

const SCHOOL_UK: Record<string, string> = {
  abjuration: 'Захист',
  conjuration: 'Виклик',
  divination: 'Пророцтво',
  enchantment: 'Чарування',
  evocation: 'Воплочення',
  illusion: 'Ілюзія',
  necromancy: 'Некромантія',
  transmutation: 'Перетворення',
}

export default function SpellsPage() {
  const [spells, setSpells] = useState<Spell[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('')
  const [school, setSchool] = useState('')
  const [page, setPage] = useState(1)

  const fetchSpells = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '21')
      if (search) params.set('search', search)
      if (level && level !== 'all') params.set('level', level)
      if (school && school !== 'all') params.set('school', school)

      const res = await fetch(`/api/spells?${params}`)
      const data = await res.json()
      setSpells(data.data)
      setPagination(data.pagination)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, search, level, school])

  useEffect(() => {
    const timeout = setTimeout(fetchSpells, 300)
    return () => clearTimeout(timeout)
  }, [fetchSpells])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleFilter = (type: 'level' | 'school', value: string) => {
    if (type === 'level') setLevel(value)
    if (type === 'school') setSchool(value)
    setPage(1)
  }

  const levelLabel = (level: number) =>
    level === 0 ? 'Заговір' : `${level} рівень`

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Заклинання</h1>
        <p className="text-muted-foreground mt-1">
          {pagination?.total ?? '...'} заклинань у базі
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Пошук заклинання..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <select
          onChange={(e) => handleFilter('level', e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm sm:w-40"
        >
          <option value="all">Всі рівні</option>
          {LEVEL_OPTIONS.map((l) => (
            <option key={l} value={l}>
              {l === '0' ? 'Заговір' : `${l} рівень`}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => handleFilter('school', e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm sm:w-44"
        >
          <option value="all">Всі школи</option>
          {SCHOOL_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {SCHOOL_UK[s] || s}
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
            {spells.map((spell) => (
              <Link key={spell._id} href={`/wiki/spells/${spell.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {spell.name_uk || spell.name_en}
                    </CardTitle>
                    {spell.name_uk && (
                      <p className="text-sm text-muted-foreground">
                        {spell.name_en}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      <Badge>{levelLabel(spell.level)}</Badge>
                      <Badge variant="secondary">
                        {t.school(spell.school, spell.school_uk)}
                      </Badge>
                      {spell.concentration && (
                        <Badge variant="outline">Концентрація</Badge>
                      )}
                      {spell.ritual && <Badge variant="outline">Ритуал</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        ⏱{' '}
                        {t.castingTime(
                          spell.casting_time,
                          spell.casting_time_uk,
                        )}
                      </p>
                      <p>📏 {t.range(spell.range, spell.range_uk)}</p>
                    </div>
                    {spell.classes?.length > 0 && (
                      <p className="text-xs text-muted-foreground truncate">
                        {spell.classes.join(', ')}
                      </p>
                    )}
                    {spell.document_title && (
                      <p className="text-xs text-muted-foreground truncate">
                        📖 {spell.document_title}
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
