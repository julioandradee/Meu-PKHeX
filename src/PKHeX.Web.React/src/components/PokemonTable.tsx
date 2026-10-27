import { useMemo } from 'react'
import { Table, type TableColumnsType, type TablePaginationConfig } from 'antd'
import type { PokemonSummary } from '@pkhex-everywhere/engine'
import { useTranslation } from '../i18n'
import { PokemonActions } from './PokemonActions'
import { PokemonSprite } from './PokemonSprite'
import { NumberFilter } from './filters/NumberFilter'
import { containsText } from './filters/containsText'
import { TextFilter } from './filters/TextFilter'

const rowKey = (pokemon: PokemonSummary) => JSON.stringify(pokemon.at)

interface PokemonTableProps {
  pokemon: PokemonSummary[]
  extraColumns?: TableColumnsType<PokemonSummary>
  actions?: boolean
  selected?: PokemonSummary[]
  onSelectedChange?: (selected: PokemonSummary[], selectedKeys: (string | number)[]) => void
  pageSize?: number
  pagination?: TablePaginationConfig | false
}


export function PokemonTable({
  pokemon,
  extraColumns = [],
  actions = true,
  selected = [],
  onSelectedChange,
  pageSize = 50,
  pagination,
}: PokemonTableProps) {
  const { t } = useTranslation()

  const columns: TableColumnsType<PokemonSummary> = useMemo(
    () => [
      {
        key: 'sprite',
        width: 80,
        render: (_: unknown, p: PokemonSummary) => <PokemonSprite pokemon={p} />,
      },
      {
        title: t('table.name', 'Name'),
        dataIndex: 'species',
        sorter: (a, b) => a.species.localeCompare(b.species),
        filterDropdown: (props) => <TextFilter {...props} placeholder={t('table.name', 'Name')} />,
        onFilter: (value, p) => containsText(p.species, value),
      },
      {
        title: t('table.level', 'Level'),
        dataIndex: 'level',
        sorter: (a, b) => a.level - b.level,
        filterDropdown: (props) => <NumberFilter {...props} placeholder={t('table.level', 'Level')} min={1} max={100} />,
        onFilter: (value, p) => p.level === value,
      },
      ...extraColumns,
      ...(actions
        ? [
            {
              title: t('table.action', 'Action'),
              key: 'action',
              render: (_: unknown, p: PokemonSummary) => <PokemonActions pokemon={p} />,
            },
          ]
        : []),
    ],
    [t, extraColumns, actions],
  )
  return (
    <Table<PokemonSummary>
      rowKey={rowKey}
      dataSource={pokemon}
      columns={columns}
      rowSelection={
        onSelectedChange && {
          preserveSelectedRowKeys: true,
          selectedRowKeys: selected.map(rowKey),
          onChange: (selectedRowKeys, rows) => {
            const keySet = new Set(selectedRowKeys.map(String))
            const map = new Map<string, PokemonSummary>()
            for (const p of selected) {
              if (keySet.has(rowKey(p))) {
                map.set(rowKey(p), p)
              }
            }
            for (const p of rows) {
              map.set(rowKey(p), p)
            }
            onSelectedChange(Array.from(map.values()), selectedRowKeys as (string | number)[])
          },
        }
      }

      size="small"
      scroll={{ x: 'max-content' }}
      pagination={
        pagination === false
          ? false
          : {
              defaultPageSize: pageSize,
              pageSizeOptions: ['10', '25', '50', '100'],
              showSizeChanger: true,
              showTotal: (total) => `${total} Pokémon`,
              ...pagination,
            }
      }
    />
  )
}
