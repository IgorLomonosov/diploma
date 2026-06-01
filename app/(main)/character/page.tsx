'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
          <h1 className="text-3xl font-bold">Мої персонажі</h1>
          <p className="text-muted-foreground mt-1">
            {characters.length} персонажів
          </p>
        </div>
        <Link href="/character/new">
          <Button>+ Новий персонаж</Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : characters.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">У тебе ще немає персонажів</p>
          <p className="text-sm mt-1">Створи свого першого героя!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((char) => (
            <Link key={char._id} href={`/character/${char._id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{char.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-2 flex-wrap">
                    {char.race && (
                      <Badge variant="secondary">{char.race}</Badge>
                    )}
                    {char.class && (
                      <Badge variant="secondary">{char.class}</Badge>
                    )}
                    <Badge>{char.level} рівень</Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>
                      ПЗ: {char.current_hit_points}/{char.max_hit_points}
                    </span>
                    <span>КО: {char.armor_class}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
