'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Character {
  _id: string
  name: string
  race: string
  class: string
  level: number
  current_hit_points: number
  max_hit_points: number
  armor_class: number
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/characters')
      .then((r) => r.json())
      .then((d) => setCharacters(d.data || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Мої персонажі</h1>
          <p className="text-slate-400 mt-1">{characters.length} персонажів</p>
        </div>
        <Link href="/character/new">
          <button className="px-4 py-2 rounded-md bg-red-800 hover:bg-red-700 text-white text-sm font-medium transition-colors">
            + Новий персонаж
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-xl bg-slate-800/50 animate-pulse"
            />
          ))}
        </div>
      ) : characters.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-slate-300">У тебе ще немає персонажів</p>
          <p className="text-sm text-slate-500 mt-1">
            Створи свого першого героя!
          </p>
          <Link href="/character/new">
            <button className="mt-4 px-6 py-2 rounded-md bg-red-800 hover:bg-red-700 text-white text-sm font-medium transition-colors">
              Створити персонажа
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((char) => (
            <Link key={char._id} href={`/character/${char._id}`}>
              <div className="group p-5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 hover:border-red-800 transition-all cursor-pointer h-full">
                <h2 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors mb-2">
                  {char.name}
                </h2>
                <div className="flex gap-2 flex-wrap mb-3">
                  {char.race && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      {char.race}
                    </span>
                  )}
                  {char.class && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      {char.class}
                    </span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/50 text-red-300">
                    {char.level} рівень
                  </span>
                </div>
                <div className="flex gap-4 text-sm text-slate-400">
                  <span>
                    ПЗ:{' '}
                    <span className="text-white">
                      {char.current_hit_points}/{char.max_hit_points}
                    </span>
                  </span>
                  <span>
                    КО: <span className="text-white">{char.armor_class}</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
