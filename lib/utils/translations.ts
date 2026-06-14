export const SIZE_UK: Record<string, string> = {
  tiny: 'Крихітний',
  small: 'Малий',
  medium: 'Середній',
  large: 'Великий',
  huge: 'Величезний',
  gargantuan: 'Жахливий',
}

export const SCHOOL_UK: Record<string, string> = {
  abjuration: 'Захист',
  conjuration: 'Виклик',
  divination: 'Пророцтво',
  enchantment: 'Чарування',
  evocation: 'Воплочення',
  illusion: 'Ілюзія',
  necromancy: 'Некромантія',
  transmutation: 'Перетворення',
}

export const TYPE_UK: Record<string, string> = {
  aberration: 'Аберація',
  beast: 'Звір',
  celestial: 'Небожитель',
  construct: 'Конструкт',
  dragon: 'Дракон',
  elemental: 'Елементаль',
  fey: 'Фея',
  fiend: 'Демон',
  giant: 'Велетень',
  humanoid: 'Гуманоїд',
  monstrosity: 'Монстр',
  ooze: 'Слиз',
  plant: 'Рослина',
  undead: 'Нежить',
  swarm: 'Рій',
}

export const ALIGNMENT_UK: Record<string, string> = {
  'lawful good': 'законно-добрий',
  'neutral good': 'нейтрально-добрий',
  'chaotic good': 'хаотично-добрий',
  'lawful neutral': 'законно-нейтральний',
  'true neutral': 'істинно-нейтральний',
  neutral: 'нейтральний',
  'chaotic neutral': 'хаотично-нейтральний',
  'lawful evil': 'законно-злий',
  'neutral evil': 'нейтрально-злий',
  'chaotic evil': 'хаотично-злий',
  unaligned: 'без Світогляд',
  'any alignment': 'будь-яке Світогляд',
  'any evil alignment': 'будь-яке злий Світогляд',
  'any non-good alignment': 'будь-яке не добре Світогляд',
  'any non-lawful alignment': 'будь-яке не законне Світогляд',
  'any chaotic alignment': 'будь-яке хаотичне Світогляд',
}

export const CASTING_TIME_UK: Record<string, string> = {
  '1 action': '1 дія',
  '1 bonus action': '1 бонусна дія',
  '1 reaction': '1 реакція',
  '1 minute': '1 хвилина',
  '10 minutes': '10 хвилин',
  '1 hour': '1 година',
  '8 hours': '8 годин',
  '24 hours': '24 години',
}

export const DURATION_UK: Record<string, string> = {
  instantaneous: 'Миттєва',
  'concentration, up to 1 minute': 'Концентрація, до 1 хвилини',
  'concentration, up to 10 minutes': 'Концентрація, до 10 хвилин',
  'concentration, up to 1 hour': 'Концентрація, до 1 години',
  'concentration, up to 8 hours': 'Концентрація, до 8 годин',
  'concentration, up to 24 hours': 'Концентрація, до 24 годин',
  '1 minute': '1 хвилина',
  '10 minutes': '10 хвилин',
  '1 hour': '1 година',
  '8 hours': '8 годин',
  '24 hours': '24 години',
  '7 days': '7 днів',
  '30 days': '30 днів',
  'until dispelled': 'Поки не розвіяно',
  'until dispelled or triggered': 'Поки не розвіяно або не спрацювало',
}

export const RANGE_UK: Record<string, string> = {
  self: 'На себе',
  touch: 'Дотик',
  sight: 'В межах видимості',
  unlimited: 'Необмежена',
  special: 'Особлива',
  '5 feet': '1.5 метри',
  '10 feet': '3 метри',
  '15 feet': '4.5 метри',
  '20 feet': '6 метрів',
  '30 feet': '9 метрів',
  '60 feet': '18 метрів',
  '90 feet': '27 метрів',
  '120 feet': '36 метрів',
  '150 feet': '45 метрів',
  '300 feet': '90 метрів',
  '500 feet': '150 метрів',
  '1 mile': '1.5 кілометри',
  '500 miles': '800 кілометрів',
}

export const t = {
  size: (val: string) => SIZE_UK[val?.toLowerCase()] || val,
  type: (val: string, uk?: string) => {
    const result = uk || TYPE_UK[val?.toLowerCase()] || val
    return result.charAt(0).toUpperCase() + result.slice(1)
  },
  school: (val: string, uk?: string) => {
    const result = uk || SCHOOL_UK[val?.toLowerCase()] || val
    return result.charAt(0).toUpperCase() + result.slice(1)
  },
  alignment: (val: string, uk?: string) =>
    uk || ALIGNMENT_UK[val?.toLowerCase()] || val,
  castingTime: (val: string, uk?: string) =>
    uk || CASTING_TIME_UK[val?.toLowerCase()] || val,
  duration: (val: string, uk?: string) =>
    uk || DURATION_UK[val?.toLowerCase()] || val,
  range: (val: string, uk?: string) =>
    uk || RANGE_UK[val?.toLowerCase()] || val,
}
