import { useMemo } from 'react'
import { DownloadOutlined } from '@ant-design/icons'
import { Button, Flex, Space, Table, type TableColumnsType, type TablePaginationConfig } from 'antd'
import type { PokemonSummary } from '@pkhex-everywhere/engine'
import { useExportPokemon } from '../hooks/useExportPokemon'
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
  batchExport?: boolean | string
  onClearSelection?: () => void
}

export function PokemonTable({
  pokemon,
  extraColumns = [],
  actions = true,
  selected = [],
  onSelectedChange,
  pageSize = 50,
  pagination,
  batchExport,
  onClearSelection,
}: PokemonTableProps) {
  const { t } = useTranslation()
  const { exportMultiple, exporting } = useExportPokemon()

  const columns: TableColumnsType<PokemonSummary> = useMemo(
    () => [
      {
        key: 'sprite',
        width: 80,
        render: (_: unknown, p: PokemonSummary) => <PokemonSprite pokemon={p} />,
      },
      {
        title: t('table.dex', 'Nº Pokédex'),
        dataIndex: 'speciesId',
        key: 'dex',
        width: 120,
        sorter: (a, b) => (a.speciesId ?? 99999) - (b.speciesId ?? 99999),
        filterDropdown: (props) => (
          <NumberFilter {...props} placeholder={t('table.dex', 'Nº Pokédex')} min={1} max={1025} />
        ),
        onFilter: (value, p) => p.speciesId === value,
        render: (_: unknown, p: PokemonSummary) => (
          <span style={{ color: '#8c8c8c', fontFamily: 'monospace', fontWeight: 600 }}>
            {p.speciesId !== null ? `#${String(p.speciesId).padStart(4, '0')}` : '—'}
          </span>
        ),
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Boolean(batchExport) && selected.length > 0 && (
        <Flex
          align="center"
          justify="space-between"
          gap={12}
          wrap="wrap"
          style={{
            padding: '10px 16px',
            background: 'rgba(22, 119, 255, 0.08)',
            borderRadius: 8,
            border: '1px solid rgba(22, 119, 255, 0.25)',
          }}
        >
          <span style={{ fontWeight: 500 }}>
            {selected.length === 1
              ? t('table.oneSelected', '1 Pokémon selecionado')
              : t('table.multipleSelected', '{0} Pokémon selecionados').replace('{0}', String(selected.length))}
          </span>
          <Space>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              loading={exporting}
              onClick={() => {
                const zipName = typeof batchExport === 'string' ? batchExport : 'pokemon_export.zip'
                void exportMultiple(selected, zipName)
              }}
            >
              {selected.length === 1
                ? t('actions.exportSingle', 'Exportar (.pk)')
                : t('actions.exportZip', 'Exportar ({0}) como .zip').replace('{0}', String(selected.length))}
            </Button>
            {onSelectedChange && (
              <Button onClick={() => (onClearSelection ? onClearSelection() : onSelectedChange([], []))}>
                {t('actions.clearSelection', 'Limpar seleção')}
              </Button>
            )}
          </Space>
        </Flex>
      )}
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
    </div>
  )
}
