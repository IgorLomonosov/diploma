'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface Result {
  success?: number
  errors?: number
  total?: number
}

interface LogEntry {
  time: string
  message: string
  result?: Result
  error?: boolean
}

interface ContentItem {
  _id: string
  name_en: string
  name_uk: string
  slug: string
  [key: string]: any
}

interface Stats {
  monsters: number
  spells: number
  races: number
  classes: number
  backgrounds: number
  feats: number
  magicItems: number
}

const SCRAPE_TYPES = [
  { type: 'monsters', label: 'Монстри', maxPages: 50 },
  { type: 'spells', label: 'Заклинання', maxPages: 20 },
  { type: 'races', label: 'Раси', maxPages: 5 },
  { type: 'classes', label: 'Класи', maxPages: 5 },
  { type: 'backgrounds', label: 'Передісторії', maxPages: 5 },
  { type: 'feats', label: 'Здібності', maxPages: 10 },
  { type: 'magic-items', label: 'Магічні предмети', maxPages: 20 },
]

const TRANSLATE_TYPES = [
  { type: 'monsters', label: 'Монстри' },
  { type: 'spells', label: 'Заклинання' },
  { type: 'races', label: 'Раси' },
]

const CONTENT_TYPES = [
  { key: 'monsters', label: 'Монстри', api: '/api/monsters' },
  { key: 'spells', label: 'Заклинання', api: '/api/spells' },
  { key: 'races', label: 'Раси', api: '/api/races' },
  { key: 'classes', label: 'Класи', api: '/api/classes' },
  { key: 'backgrounds', label: 'Передісторії', api: '/api/backgrounds' },
  { key: 'feats', label: 'Здібності', api: '/api/feats' },
  { key: 'magic-items', label: 'Магічні предмети', api: '/api/magic-items' },
]

export default function AdminPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [log, setLog] = useState<LogEntry[]>([])
  const [translateLimit, setTranslateLimit] = useState(10)
  const [stats, setStats] = useState<Stats | null>(null)
  const [activeTab, setActiveTab] = useState<'scrape' | 'manage'>('scrape')

  // Управління контентом
  const [selectedType, setSelectedType] = useState(CONTENT_TYPES[0])
  const [items, setItems] = useState<ContentItem[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const addLog = (message: string, result?: Result, error = false) => {
    const time = new Date().toLocaleTimeString('uk-UA')
    setLog((prev) => [{ time, message, result, error }, ...prev])
  }

  const fetchStats = useCallback(async () => {
    try {
      const results = await Promise.all(
        CONTENT_TYPES.map((t) =>
          fetch(`${t.api}?limit=1`).then((r) => r.json()),
        ),
      )
      setStats({
        monsters: results[0].pagination?.total ?? 0,
        spells: results[1].pagination?.total ?? 0,
        races: results[2].pagination?.total ?? 0,
        classes: results[3].pagination?.total ?? 0,
        backgrounds: results[4].pagination?.total ?? 0,
        feats: results[5].pagination?.total ?? 0,
        magicItems: results[6].pagination?.total ?? 0,
      })
    } catch {}
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const fetchItems = useCallback(async () => {
    setItemsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' })
      if (search) params.set('search', search)
      const res = await fetch(`${selectedType.api}?${params}`)
      const data = await res.json()
      setItems(data.data || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch {
    } finally {
      setItemsLoading(false)
    }
  }, [selectedType, page, search])

  useEffect(() => {
    if (activeTab === 'manage') fetchItems()
  }, [activeTab, fetchItems])

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id)
      return
    }
    setDeleteConfirm(null)
    try {
      const res = await fetch(`/api/admin/content/${selectedType.key}/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Помилка видалення')
      setItems((prev) => prev.filter((i) => i._id !== id))
      addLog(`🗑️ Видалено запис з ${selectedType.label}`)
      fetchStats()
    } catch (err: any) {
      addLog(`❌ ${err.message}`, undefined, true)
    }
  }

  const runScrape = async (type: string, maxPages: number) => {
    setLoading(`scrape-${type}`)
    addLog(`⏳ Скрапінг "${type}" розпочато...`)
    try {
      const res = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, maxPages }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      addLog(`✅ ${data.message}`, data.result)
      fetchStats()
    } catch (err: any) {
      addLog(`❌ Помилка: ${err.message}`, undefined, true)
    } finally {
      setLoading(null)
    }
  }

  const runTranslate = async (type: string) => {
    setLoading(`translate-${type}`)
    addLog(`⏳ Переклад "${type}" (ліміт: ${translateLimit})...`)
    try {
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, limit: translateLimit }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      addLog(`✅ ${data.message}`, data.result)
    } catch (err: any) {
      addLog(`❌ Помилка: ${err.message}`, undefined, true)
    } finally {
      setLoading(null)
    }
  }

  const statsMap = stats
    ? [
        stats.monsters,
        stats.spells,
        stats.races,
        stats.classes,
        stats.backgrounds,
        stats.feats,
        stats.magicItems,
      ]
    : []

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Адмін-панель</h1>
        <p className="text-muted-foreground mt-1">
          Управління контентом платформи
        </p>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {CONTENT_TYPES.map((t, i) => (
            <Card key={t.key} className="text-center">
              <CardContent className="pt-3 pb-3">
                <div className="text-xl font-bold">{statsMap[i]}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {t.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Таби */}
      <div className="flex gap-2 border-b pb-0">
        {[
          { key: 'scrape', label: '📥 Скрапінг і переклад' },
          { key: 'manage', label: '🗂️ Управління контентом' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Таб: Скрапінг */}
      {activeTab === 'scrape' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Скрапінг контенту</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SCRAPE_TYPES.map(({ type, label, maxPages }) => (
                  <Button
                    key={type}
                    variant="outline"
                    className="h-auto flex flex-col py-3 gap-1"
                    disabled={loading !== null}
                    onClick={() => runScrape(type, maxPages)}
                  >
                    <span>{loading === `scrape-${type}` ? '⏳' : '📥'}</span>
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">
                      до {maxPages} стор.
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Переклад (Gemini AI)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">Ліміт за раз:</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={translateLimit}
                  onChange={(e) =>
                    setTranslateLimit(parseInt(e.target.value) || 10)
                  }
                  className="w-20 h-9 rounded-md border border-input bg-background px-3 text-sm"
                />
                <span className="text-xs text-muted-foreground">
                  (рекомендовано 5–20)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TRANSLATE_TYPES.map(({ type, label }) => (
                  <Button
                    key={type}
                    variant="outline"
                    className="h-auto flex flex-col py-3 gap-1"
                    disabled={loading !== null}
                    onClick={() => runTranslate(type)}
                  >
                    <span>{loading === `translate-${type}` ? '⏳' : '🌐'}</span>
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">
                      {translateLimit} шт.
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {log.length > 0 && (
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle>Лог</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setLog([])}>
                  Очистити
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 max-h-60 overflow-y-auto">
                {log.map((entry, i) => (
                  <div
                    key={i}
                    className={`text-sm p-2 rounded border ${entry.error ? 'border-red-200 bg-red-50 dark:bg-red-950/20' : 'border-border bg-muted/30'}`}
                  >
                    <div className="flex justify-between gap-2">
                      <span>{entry.message}</span>
                      <span className="text-xs text-muted-foreground">
                        {entry.time}
                      </span>
                    </div>
                    {entry.result && (
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          ✅ {entry.result.success}
                        </Badge>
                        {(entry.result.errors ?? 0) > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            ❌ {entry.result.errors}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          всього: {entry.result.total}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Таб: Управління */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map((t) => (
              <Button
                key={t.key}
                size="sm"
                variant={selectedType.key === t.key ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedType(t)
                  setPage(1)
                  setSearch('')
                }}
              >
                {t.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder={`Пошук у ${selectedType.label}...`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="max-w-xs"
            />
            <Button variant="outline" size="sm" onClick={fetchItems}>
              🔄 Оновити
            </Button>
          </div>

          <Card>
            <CardContent className="pt-4">
              {itemsLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 rounded bg-muted animate-pulse"
                    />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Нічого не знайдено
                </p>
              ) : (
                <div className="space-y-1">
                  {items.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between p-2 rounded hover:bg-muted gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">
                          {item.name_uk || item.name_en}
                        </span>
                        {item.name_uk && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {item.name_en}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!item.name_uk && (
                          <Badge
                            variant="outline"
                            className="text-xs text-orange-500"
                          >
                            не перекладено
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant={
                            deleteConfirm === item._id ? 'destructive' : 'ghost'
                          }
                          className="h-7 px-2 text-xs"
                          onClick={() => handleDelete(item._id)}
                        >
                          {deleteConfirm === item._id ? 'Підтвердити' : '🗑️'}
                        </Button>
                        {deleteConfirm === item._id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            Скасувати
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Назад
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Далі
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
