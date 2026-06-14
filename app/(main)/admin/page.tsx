'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface Result {
  success?: number
  errors?: number
  total?: number
  upserted?: number
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
}

const SCRAPE_TYPES = [
  { type: 'monsters', label: 'Монстри', defaultPages: 50 },
  { type: 'spells', label: 'Заклинання', defaultPages: 20 },
  { type: 'races', label: 'Раси', defaultPages: 5 },
  { type: 'classes', label: 'Класи', defaultPages: 5 },
  { type: 'backgrounds', label: 'Передісторії', defaultPages: 5 },
  { type: 'feats', label: 'Здібності', defaultPages: 10 },
  { type: 'magic-items', label: 'Магічні предмети', defaultPages: 20 },
  { type: 'conditions', label: 'Стани', defaultPages: 1 },
  { type: 'equipment', label: 'Спорядження', defaultPages: 1 },
  { type: 'sections', label: 'Правила', defaultPages: 5 },
]

const TRANSLATE_TYPES = [
  { type: 'monsters', label: 'Монстри' },
  { type: 'spells', label: 'Заклинання' },
  { type: 'races', label: 'Раси' },
  { type: 'classes', label: 'Класи' },
  { type: 'backgrounds', label: 'Передісторії' },
  { type: 'feats', label: 'Здібності' },
  { type: 'magic-items', label: 'Магічні предмети' },
  { type: 'conditions', label: 'Стани' },
  { type: 'equipment', label: 'Спорядження' },
  { type: 'sections', label: 'Правила' },
]

const CONTENT_TYPES = [
  { key: 'monsters', label: 'Монстри', api: '/api/monsters' },
  { key: 'spells', label: 'Заклинання', api: '/api/spells' },
  { key: 'races', label: 'Раси', api: '/api/races' },
  { key: 'classes', label: 'Класи', api: '/api/classes' },
  { key: 'backgrounds', label: 'Передісторії', api: '/api/backgrounds' },
  { key: 'feats', label: 'Здібності', api: '/api/feats' },
  { key: 'magic-items', label: 'Магічні предмети', api: '/api/magic-items' },
  { key: 'conditions', label: 'Стани', api: '/api/conditions' },
  { key: 'equipment', label: 'Спорядження', api: '/api/equipment' },
  { key: 'sections', label: 'Правила', api: '/api/sections' },
]

const inputClass =
  'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-9'
const cardClass = 'rounded-xl border border-slate-700 bg-slate-900/60 p-5'

export default function AdminPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [log, setLog] = useState<LogEntry[]>([])
  const [translateLimit, setTranslateLimit] = useState(10)
  const [activeTab, setActiveTab] = useState<'scrape' | 'manage'>('scrape')
  const [pages, setPages] = useState<Record<string, number>>(
    Object.fromEntries(SCRAPE_TYPES.map((t) => [t.type, t.defaultPages])),
  )

  const [selectedType, setSelectedType] = useState(CONTENT_TYPES[0])
  const [items, setItems] = useState<ContentItem[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [stats, setStats] = useState<Record<string, number>>({})

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
      const s: Record<string, number> = {}
      CONTENT_TYPES.forEach((t, i) => {
        s[t.key] = results[i].pagination?.total ?? results[i].total ?? 0
      })
      setStats(s)
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
      addLog(`Видалено запис з ${selectedType.label}`)
      fetchStats()
    } catch (err: any) {
      addLog(err.message, undefined, true)
    }
  }

  const handleTranslate = async (id: string) => {
    setLoading(`translate-item-${id}`)
    try {
      const res = await fetch('/api/admin/translate-one', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType.key, id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setItems((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, name_uk: data.name_uk } : item,
        ),
      )
      addLog(`✅ Перекладено: ${data.name_uk}`)
    } catch (err: any) {
      addLog(`❌ ${err.message}`, undefined, true)
    } finally {
      setLoading(null)
    }
  }

  const runScrape = async (type: string) => {
    setLoading(`scrape-${type}`)
    addLog(`Скрапінг "${type}" розпочато...`)
    try {
      const res = await fetch('/api/admin/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, maxPages: pages[type] }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      addLog(data.message, data.result)
      fetchStats()
    } catch (err: any) {
      addLog(err.message, undefined, true)
    } finally {
      setLoading(null)
    }
  }

  const runTranslate = async (type: string) => {
    setLoading(`translate-${type}`)
    addLog(`Переклад "${type}" (ліміт: ${translateLimit})...`)
    try {
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, limit: translateLimit }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      addLog(data.message, data.result)
    } catch (err: any) {
      addLog(err.message, undefined, true)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Адмін-панель</h1>
        <p className="text-slate-400 mt-1">Управління контентом платформи</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {CONTENT_TYPES.map((t) => (
          <div
            key={t.key}
            className="text-center p-2 rounded-lg border border-slate-700 bg-slate-900/50"
          >
            <div className="text-lg font-bold text-white">
              {stats[t.key] ?? '—'}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{t.label}</div>
          </div>
        ))}
      </div>

      {/* Таби */}
      <div className="flex gap-1 border-b border-slate-700">
        {[
          { key: 'scrape', label: 'Скрапінг і переклад' },
          { key: 'manage', label: 'Управління контентом' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-red-500 text-white'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'scrape' && (
        <div className="space-y-5">
          {/* Скрапінг */}
          <div className={cardClass}>
            <h2 className="text-base font-semibold text-white mb-4">
              Скрапінг контенту
            </h2>
            <div className="space-y-2">
              {SCRAPE_TYPES.map(({ type, label }) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-sm text-slate-300 w-40 shrink-0">
                    {label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Сторінок:</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={pages[type]}
                      onChange={(e) =>
                        setPages((p) => ({
                          ...p,
                          [type]: parseInt(e.target.value) || 1,
                        }))
                      }
                      className="w-16 h-8 rounded border border-slate-700 bg-slate-800 text-white text-sm px-2"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 h-8"
                    disabled={loading !== null}
                    onClick={() => runScrape(type)}
                  >
                    {loading === `scrape-${type}`
                      ? 'Завантаження...'
                      : 'Скрапити'}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Переклад */}
          <div className={cardClass}>
            <h2 className="text-base font-semibold text-white mb-4">
              Переклад (Gemini AI)
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-slate-300">Ліміт за раз:</span>
              <input
                type="number"
                min={1}
                max={50}
                value={translateLimit}
                onChange={(e) =>
                  setTranslateLimit(parseInt(e.target.value) || 10)
                }
                className="w-20 h-8 rounded border border-slate-700 bg-slate-800 text-white text-sm px-2"
              />
              <span className="text-xs text-slate-500">
                (рекомендовано 5–20)
              </span>
            </div>
            <div className="space-y-2">
              {TRANSLATE_TYPES.map(({ type, label }) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-sm text-slate-300 w-40 shrink-0">
                    {label}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 h-8"
                    disabled={loading !== null}
                    onClick={() => runTranslate(type)}
                  >
                    {loading === `translate-${type}`
                      ? 'Переклад...'
                      : 'Перекласти'}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Лог */}
          {log.length > 0 && (
            <div className={cardClass}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-white">
                  Лог операцій
                </h2>
                <button
                  onClick={() => setLog([])}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Очистити
                </button>
              </div>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {log.map((entry, i) => (
                  <div
                    key={i}
                    className={`text-sm p-2 rounded border ${entry.error ? 'border-red-800 bg-red-950/30' : 'border-slate-700 bg-slate-800/50'}`}
                  >
                    <div className="flex justify-between gap-2">
                      <span
                        className={
                          entry.error ? 'text-red-400' : 'text-slate-300'
                        }
                      >
                        {entry.message}
                      </span>
                      <span className="text-xs text-slate-500 shrink-0">
                        {entry.time}
                      </span>
                    </div>
                    {entry.result && (
                      <div className="flex gap-2 mt-1">
                        {entry.result.upserted !== undefined && (
                          <Badge variant="secondary" className="text-xs">
                            збережено: {entry.result.upserted}
                          </Badge>
                        )}
                        {entry.result.success !== undefined && (
                          <Badge variant="secondary" className="text-xs">
                            успішно: {entry.result.success}
                          </Badge>
                        )}
                        {(entry.result.errors ?? 0) > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            помилок: {entry.result.errors}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setSelectedType(t)
                  setPage(1)
                  setSearch('')
                }}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  selectedType.key === t.key
                    ? 'bg-red-800 border-red-700 text-white'
                    : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {t.label}
              </button>
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
              className={`max-w-xs ${inputClass}`}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={fetchItems}
              className="border-slate-700 text-slate-300 hover:text-white"
            >
              Оновити
            </Button>
          </div>

          <div className={cardClass}>
            {itemsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 rounded bg-slate-800 animate-pulse"
                  />
                ))}
              </div>
            ) : items.length === 0 ? (
              <p className="text-center text-slate-500 py-8">
                Нічого не знайдено
              </p>
            ) : (
              <div className="space-y-1">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-2 rounded hover:bg-slate-800/50 gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm text-white">
                        {item.name_uk || item.name_en}
                      </span>
                      {item.name_uk && (
                        <span className="text-xs text-slate-500 ml-2">
                          {item.name_en}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {!item.name_uk && (
                        <span className="text-xs text-orange-500">
                          не перекладено
                        </span>
                      )}
                      <button
                        onClick={() => handleTranslate(item._id)}
                        disabled={loading !== null}
                        className="text-xs px-2 py-1 rounded border border-slate-700 text-slate-400 hover:text-blue-400 hover:border-blue-800 disabled:opacity-40 transition-colors"
                      >
                        {loading === `translate-item-${item._id}`
                          ? 'Переклад... '
                          : 'Перекласти '}
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${
                          deleteConfirm === item._id
                            ? 'bg-red-800 border-red-700 text-white'
                            : 'border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-800'
                        }`}
                      >
                        {deleteConfirm === item._id
                          ? 'Підтвердити'
                          : 'Видалити'}
                      </button>
                      {deleteConfirm === item._id && (
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs px-2 py-1 rounded border border-slate-700 text-slate-400 hover:text-white"
                        >
                          Скасувати
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="text-sm px-3 py-1 rounded border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40"
                >
                  Назад
                </button>
                <span className="text-sm text-slate-500">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="text-sm px-3 py-1 rounded border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40"
                >
                  Далі
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
