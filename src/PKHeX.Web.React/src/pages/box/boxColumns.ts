import type { TableColumnsType } from 'antd'
import type { PokemonSummary } from '@pkhex-everywhere/engine'

const boxNumber = (pokemon: PokemonSummary) => (pokemon.at.box ?? 0) + 1

export type TranslateFn = (key: string, fallback?: string) => string

export function getBoxColumns(t: TranslateFn = (_key, fallback) => fallback ?? _key): TableColumnsType<PokemonSummary> {
  return [
    {
      title: t('table.box', 'Box'),
      key: 'box',
      render: (_, pokemon) => boxNumber(pokemon),
      sorter: (a, b) => boxNumber(a) - boxNumber(b) || a.at.slot - b.at.slot,
    },
  ]
}

export const boxColumns = getBoxColumns()
