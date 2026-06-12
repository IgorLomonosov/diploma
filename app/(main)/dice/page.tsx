'use client'

import { useState } from 'react'

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

const cardClass = 'rounded-xl border border-slate-700 bg-slate-900/60 p-5'

function rollDie(sides: number) {
  return Math.floor(Math.random() * sides) + 1
}

function parseExpression(expr: string) {
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
    if (dMatch)
      dice.push({
        count: parseInt(dMatch[2]) * (dMatch[1] === '-' ? -1 : 1),
        sides: parseInt(dMatch[3]),
      })
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
    for (let i = 0; i < Math.abs(d.count); i++) allRolls.push(rollDie(d.sides))
  }
  if (allRolls.length === 0) {
    const dMatch = expression.match(/d(\d+)/i)
    if (dMatch) allRolls.push(rollDie(parseInt(dMatch[1])))
  }
  let total: number
  let type: RollResult['type'] = 'normal'
  if ((advantage || disadvantage) && allRolls.length >= 2) {
    const sorted = [...allRolls].sort((a, b) => b - a)
    total = (advantage ? sorted[0] : sorted[sorted.length - 1]) + modifier
    type = advantage ? 'advantage' : 'disadvantage'
  } else {
    total = allRolls.reduce((s, r) => s + r, 0) + modifier
  }
  if (allRolls.length === 1 && allRolls[0] === 20 && expression.includes('d20'))
    type = 'critical'
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

  const addRoll = (result: RollResult) => {
    setLastResult(result)
    setHistory((prev) => [result, ...prev].slice(0, 30))
  }

  const rollSingle = async (sides: number) => {
    setRolling(sides)
    await new Promise((r) => setTimeout(r, 200))
    const count = counts[sides] || 1
    const expr = `${count}d${sides}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}`
    addRoll(executeRoll(expr, `${count}d${sides}`))
    setRolling(null)
  }

  const resultColor = (result: RollResult) => {
    if (result.type === 'critical') return 'text-yellow-400'
    if (result.rolls.length === 1 && result.rolls[0] === 1)
      return 'text-red-400'
    if (result.type === 'advantage') return 'text-green-400'
    if (result.type === 'disadvantage') return 'text-orange-400'
    return 'text-white'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-white">🎲 Кидки кубиків</h1>
        <p className="text-slate-400 mt-1">
          Кидай кубики для атак, перевірок та рятівних кидків
        </p>
      </div>

      {/* Останній результат */}
      {lastResult && (
        <div
          className={`${cardClass} text-center ${lastResult.type === 'critical' ? 'border-yellow-600' : ''}`}
        >
          <p className="text-sm text-slate-400 mb-1">
            {lastResult.label || lastResult.expression}
            {lastResult.type === 'advantage' && ' · Перевага'}
            {lastResult.type === 'disadvantage' && ' · Недолік'}
            {lastResult.type === 'critical' && ' · 🌟 КРИТИЧНИЙ УДАР!'}
          </p>
          <p className={`text-7xl font-bold ${resultColor(lastResult)}`}>
            {lastResult.total}
          </p>
          <div className="flex justify-center gap-1 mt-3 flex-wrap">
            {lastResult.rolls.map((r, i) => (
              <span
                key={i}
                className={`text-sm px-2 py-0.5 rounded-full font-medium ${
                  r === 20
                    ? 'bg-yellow-800 text-yellow-200'
                    : r === 1
                      ? 'bg-red-900 text-red-200'
                      : 'bg-slate-700 text-slate-300'
                }`}
              >
                {r}
              </span>
            ))}
            {lastResult.modifier !== 0 && (
              <span className="text-sm px-2 py-0.5 rounded-full bg-slate-800 border border-slate-600 text-slate-300">
                {lastResult.modifier > 0
                  ? `+${lastResult.modifier}`
                  : lastResult.modifier}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Стандартні кубики */}
        <div className={cardClass}>
          <h2 className="text-base font-semibold text-white mb-4">
            Стандартні кубики
          </h2>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm text-slate-400 whitespace-nowrap">
              Модифікатор:
            </label>
            <input
              type="number"
              value={modifier}
              onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
              className="w-20 h-9 rounded-md border border-slate-700 bg-slate-800 text-white px-3 text-sm"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {DICE.map((sides) => (
              <div key={sides} className="space-y-1">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() =>
                      setCounts((p) => ({
                        ...p,
                        [sides]: Math.max(1, (p[sides] || 1) - 1),
                      }))
                    }
                    className="text-xs text-slate-500 hover:text-white w-4"
                  >
                    −
                  </button>
                  <span className="text-xs text-slate-400 w-4 text-center">
                    {counts[sides]}
                  </span>
                  <button
                    onClick={() =>
                      setCounts((p) => ({
                        ...p,
                        [sides]: Math.min(20, (p[sides] || 1) + 1),
                      }))
                    }
                    className="text-xs text-slate-500 hover:text-white w-4"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => rollSingle(sides)}
                  disabled={rolling !== null}
                  className="w-full h-14 flex flex-col items-center justify-center gap-0.5 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:border-red-800 transition-all disabled:opacity-40"
                >
                  <span
                    className={`text-xl text-slate-300 ${rolling === sides ? 'animate-spin' : ''}`}
                  >
                    ⬡
                  </span>
                  <span className="text-xs text-slate-400">d{sides}</span>
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const expr = Object.entries(counts)
                  .filter(([, c]) => c > 0)
                  .map(([s, c]) => `${c}d${s}`)
                  .join('+')
                const full =
                  modifier !== 0
                    ? expr + (modifier > 0 ? `+${modifier}` : modifier)
                    : expr
                addRoll(executeRoll(full, 'Усі кубики'))
              }}
              disabled={rolling !== null}
              className="w-full h-14 flex flex-col items-center justify-center gap-0.5 rounded-lg border border-red-800 bg-red-900/30 hover:bg-red-900/50 transition-all disabled:opacity-40"
            >
              <span className="text-lg">🎲</span>
              <span className="text-xs text-red-300">Всі</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Швидкі кидки */}
          <div className={cardClass}>
            <h2 className="text-base font-semibold text-white mb-3">
              Швидкі кидки
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() =>
                    addRoll(executeRoll(preset.expr, preset.label))
                  }
                  className="flex flex-col items-center py-2.5 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:border-red-800 transition-all"
                >
                  <span className="font-medium text-sm text-white">
                    {preset.label}
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5">
                    {preset.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Довільний вираз */}
          <div className={cardClass}>
            <h2 className="text-base font-semibold text-white mb-3">
              Довільний вираз
            </h2>
            <div className="space-y-2">
              <input
                placeholder="напр. 2d6+3, 4d8, 1d20+5"
                value={customExpr}
                onChange={(e) => setCustomExpr(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' &&
                  customExpr.trim() &&
                  addRoll(executeRoll(customExpr, customLabel || customExpr))
                }
                className="w-full h-9 rounded-md border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 px-3 text-sm"
              />
              <input
                placeholder="Назва (необов'язково)"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 px-3 text-sm"
              />
              <button
                onClick={() =>
                  customExpr.trim() &&
                  addRoll(executeRoll(customExpr, customLabel || customExpr))
                }
                disabled={!customExpr.trim()}
                className="w-full py-2 text-sm rounded-md bg-red-800 hover:bg-red-700 text-white font-medium transition-colors disabled:opacity-40"
              >
                Кинути
              </button>
              <p className="text-xs text-slate-600">
                Підтримується: 2d6+3, 1d20adv (перевага), 1d20dis (недолік)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Історія */}
      {history.length > 0 && (
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white">
              Історія кидків
            </h2>
            <button
              onClick={() => {
                setHistory([])
                setLastResult(null)
              }}
              className="text-xs text-slate-500 hover:text-white"
            >
              Очистити
            </button>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {history.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between text-sm py-1.5 border-b border-slate-800 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 text-xs w-16 shrink-0">
                    {r.timestamp.toLocaleTimeString('uk-UA', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <span className="text-slate-300">
                    {r.label || r.expression}
                  </span>
                  {r.type === 'advantage' && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-green-900/50 text-green-400">
                      перевага
                    </span>
                  )}
                  {r.type === 'disadvantage' && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-orange-900/50 text-orange-400">
                      недолік
                    </span>
                  )}
                  {r.type === 'critical' && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-900/50 text-yellow-400">
                      крит!
                    </span>
                  )}
                  {r.rolls.length === 1 && r.rolls[0] === 1 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-900/50 text-red-400">
                      провал!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600">
                    [{r.rolls.join(', ')}]
                    {r.modifier !== 0 &&
                      (r.modifier > 0 ? `+${r.modifier}` : r.modifier)}
                  </span>
                  <span
                    className={`font-bold w-8 text-right tabular-nums ${resultColor(r)}`}
                  >
                    {r.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
