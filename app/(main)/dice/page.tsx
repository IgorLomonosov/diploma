'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface RollResult {
  id: string
  expression: string
  rolls: number[]
  modifier: number
  total: number
  label?: string
  type?: 'normal' | 'advantage' | 'disadvantage' | 'critical'
  timestamp: Date
}

const DICE = [4, 6, 8, 10, 12, 20, 100]

const PRESETS = [
  { label: 'Атака', expr: '1d20', hint: '+модифікатор атаки' },
  { label: 'Перевага', expr: '2d20kh1', hint: 'вищий результат' },
  { label: 'Недолік', expr: '2d20kl1', hint: 'нижчий результат' },
  { label: 'Ініціатива', expr: '1d20', hint: '+модифікатор СПР' },
  { label: 'Смерть', expr: '1d20', hint: 'рятівний кидок' },
  { label: 'Відновлення', expr: '1d10', hint: 'кості ПЗ + CON' },
]

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

function parseExpression(expr: string): {
  dice: { count: number; sides: number }[]
  modifier: number
  advantage: boolean
  disadvantage: boolean
} {
  const clean = expr.toLowerCase().replace(/\s/g, '')
  const advantage = clean.includes('kh1') || clean.includes('adv')
  const disadvantage = clean.includes('kl1') || clean.includes('dis')
  const cleaned = clean.replace(/kh1|kl1|adv|dis/g, '')

  let modifier = 0
  const modMatch = cleaned.match(/([+-]\d+)$/)
  if (modMatch) modifier = parseInt(modMatch[1])

  const diceStr = cleaned.replace(/[+-]\d+$/, '')
  const dice: { count: number; sides: number }[] = []

  const parts = diceStr.split(/(?=[+-])/).filter(Boolean)
  for (const part of parts) {
    const dMatch = part.match(/([+-]?)(\d+)d(\d+)/i)
    if (dMatch) {
      const sign = dMatch[1] === '-' ? -1 : 1
      dice.push({
        count: parseInt(dMatch[2]) * sign,
        sides: parseInt(dMatch[3]),
      })
    }
  }

  if (dice.length === 0) {
    const simple = diceStr.match(/(\d+)d(\d+)/i)
    if (simple)
      dice.push({ count: parseInt(simple[1]), sides: parseInt(simple[2]) })
  }

  return { dice, modifier, advantage, disadvantage }
}

function executeRoll(expression: string, label?: string): RollResult {
  const { dice, modifier, advantage, disadvantage } =
    parseExpression(expression)
  const allRolls: number[] = []

  for (const d of dice) {
    const count = Math.abs(d.count)
    for (let i = 0; i < count; i++) {
      allRolls.push(rollDie(d.sides))
    }
  }

  if (allRolls.length === 0) {
    const dMatch = expression.match(/d(\d+)/i)
    if (dMatch) allRolls.push(rollDie(parseInt(dMatch[1])))
  }

  let total: number
  let type: RollResult['type'] = 'normal'

  if ((advantage || disadvantage) && allRolls.length >= 2) {
    const sorted = [...allRolls].sort((a, b) => b - a)
    const chosen = advantage ? sorted[0] : sorted[sorted.length - 1]
    total = chosen + modifier
    type = advantage ? 'advantage' : 'disadvantage'
  } else {
    total = allRolls.reduce((s, r) => s + r, 0) + modifier
  }

  if (
    allRolls.length === 1 &&
    allRolls[0] === 20 &&
    expression.includes('d20')
  ) {
    type = 'critical'
  }

  return {
    id: crypto.randomUUID(),
    expression,
    rolls: allRolls,
    modifier,
    total,
    label,
    type,
    timestamp: new Date(),
  }
}

function DieIcon({ sides, rolling }: { sides: number; rolling: boolean }) {
  const icons: Record<number, string> = {
    4: '▲',
    6: '⬡',
    8: '◆',
    10: '⬟',
    12: '⬠',
    20: '⬡',
    100: '%',
  }
  return (
    <span
      className={`text-2xl transition-transform ${rolling ? 'animate-spin' : ''}`}
    >
      {icons[sides] || '🎲'}
    </span>
  )
}

export default function DicePage() {
  const [history, setHistory] = useState<RollResult[]>([])
  const [customExpr, setCustomExpr] = useState('')
  const [customLabel, setCustomLabel] = useState('')
  const [rolling, setRolling] = useState<number | null>(null)
  const [lastResult, setLastResult] = useState<RollResult | null>(null)
  const [counts, setCounts] = useState<Record<number, number>>({
    4: 1,
    6: 1,
    8: 1,
    10: 1,
    12: 1,
    20: 1,
    100: 1,
  })
  const [modifier, setModifier] = useState(0)
  const audioRef = useRef<boolean>(false)

  const addRoll = (result: RollResult) => {
    setLastResult(result)
    setHistory((prev) => [result, ...prev].slice(0, 30))
  }

  const rollSingle = async (sides: number) => {
    setRolling(sides)
    await new Promise((r) => setTimeout(r, 300))
    const count = counts[sides] || 1
    const expr = `${count}d${sides}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}`
    const result = executeRoll(expr, `${count}d${sides}`)
    addRoll(result)
    setRolling(null)
  }

  const rollCustom = () => {
    if (!customExpr.trim()) return
    try {
      const result = executeRoll(customExpr, customLabel || customExpr)
      addRoll(result)
    } catch {
      alert('Невірний формат виразу')
    }
  }

  const rollPreset = (preset: (typeof PRESETS)[0]) => {
    const result = executeRoll(preset.expr, preset.label)
    addRoll(result)
  }

  const resultColor = (result: RollResult) => {
    if (result.type === 'critical') return 'text-yellow-500'
    if (result.rolls.length === 1 && result.rolls[0] === 1)
      return 'text-red-500'
    if (result.type === 'advantage') return 'text-green-500'
    if (result.type === 'disadvantage') return 'text-orange-500'
    return 'text-primary'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🎲 Кидки кубиків</h1>
        <p className="text-muted-foreground mt-1">
          Кидай кубики для атак, перевірок та рятівних кидків
        </p>
      </div>

      {/* Останній результат */}
      {lastResult && (
        <Card
          className={`border-2 ${lastResult.type === 'critical' ? 'border-yellow-400' : 'border-primary'}`}
        >
          <CardContent className="pt-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">
              {lastResult.label || lastResult.expression}
              {lastResult.type === 'advantage' && ' · Перевага'}
              {lastResult.type === 'disadvantage' && ' · Недолік'}
              {lastResult.type === 'critical' && ' · 🌟 КРИТИЧНИЙ УДАР!'}
            </p>
            <p className={`text-6xl font-bold ${resultColor(lastResult)}`}>
              {lastResult.total}
            </p>
            <div className="flex justify-center gap-1 mt-2 flex-wrap">
              {lastResult.rolls.map((r, i) => (
                <Badge
                  key={i}
                  variant={
                    r === 20 ? 'default' : r === 1 ? 'destructive' : 'secondary'
                  }
                  className="text-sm"
                >
                  {r}
                </Badge>
              ))}
              {lastResult.modifier !== 0 && (
                <Badge variant="outline" className="text-sm">
                  {lastResult.modifier > 0
                    ? `+${lastResult.modifier}`
                    : lastResult.modifier}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Стандартні кубики */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Стандартні кубики</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap">
                Модифікатор:
              </label>
              <Input
                type="number"
                value={modifier}
                onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                className="w-20"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {DICE.map((sides) => (
                <div key={sides} className="space-y-1">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        setCounts((p) => ({
                          ...p,
                          [sides]: Math.max(1, (p[sides] || 1) - 1),
                        }))
                      }
                    >
                      −
                    </button>
                    <span className="text-xs w-4 text-center">
                      {counts[sides]}
                    </span>
                    <button
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        setCounts((p) => ({
                          ...p,
                          [sides]: Math.min(20, (p[sides] || 1) + 1),
                        }))
                      }
                    >
                      +
                    </button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full h-14 flex flex-col gap-0.5"
                    onClick={() => rollSingle(sides)}
                    disabled={rolling !== null}
                  >
                    <DieIcon sides={sides} rolling={rolling === sides} />
                    <span className="text-xs">d{sides}</span>
                  </Button>
                </div>
              ))}
              {/* Кнопка кинути всі */}
              <Button
                variant="default"
                className="w-full h-14 flex flex-col gap-0.5 col-span-1"
                onClick={() => {
                  const expr = Object.entries(counts)
                    .filter(([, c]) => c > 0)
                    .map(([s, c]) => `${c}d${s}`)
                    .join('+')
                  if (modifier !== 0) {
                    const full =
                      expr + (modifier > 0 ? `+${modifier}` : modifier)
                    addRoll(executeRoll(full, 'Усі кубики'))
                  } else {
                    addRoll(executeRoll(expr, 'Усі кубики'))
                  }
                }}
                disabled={rolling !== null}
              >
                <span className="text-lg">🎲</span>
                <span className="text-xs">Всі</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Пресети та довільний вираз */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Швидкі кидки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    className="h-auto flex flex-col py-2 gap-0.5"
                    onClick={() => rollPreset(preset)}
                  >
                    <span className="font-medium text-sm">{preset.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {preset.hint}
                    </span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Довільний вираз</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                placeholder="напр. 2d6+3, 4d8, 1d20+5"
                value={customExpr}
                onChange={(e) => setCustomExpr(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && rollCustom()}
              />
              <Input
                placeholder="Назва (необов'язково)"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={rollCustom}
                disabled={!customExpr.trim()}
              >
                Кинути
              </Button>
              <p className="text-xs text-muted-foreground">
                Підтримується: <code>2d6+3</code>, <code>1d20adv</code>{' '}
                (перевага), <code>1d20dis</code> (недолік)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Історія */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle>Історія кидків</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setHistory([])
                setLastResult(null)
              }}
            >
              Очистити
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {history.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between text-sm py-1.5 border-b last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs w-12 shrink-0">
                      {r.timestamp.toLocaleTimeString('uk-UA', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                    <span>{r.label || r.expression}</span>
                    {r.type === 'advantage' && (
                      <Badge
                        variant="outline"
                        className="text-xs text-green-600"
                      >
                        перевага
                      </Badge>
                    )}
                    {r.type === 'disadvantage' && (
                      <Badge
                        variant="outline"
                        className="text-xs text-orange-600"
                      >
                        недолік
                      </Badge>
                    )}
                    {r.type === 'critical' && (
                      <Badge className="text-xs bg-yellow-500">крит!</Badge>
                    )}
                    {r.rolls.length === 1 && r.rolls[0] === 1 && (
                      <Badge variant="destructive" className="text-xs">
                        провал!
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      [{r.rolls.join(', ')}]
                      {r.modifier !== 0 &&
                        (r.modifier > 0 ? `+${r.modifier}` : r.modifier)}
                    </span>
                    <span
                      className={`font-bold w-8 text-right ${resultColor(r)}`}
                    >
                      {r.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
