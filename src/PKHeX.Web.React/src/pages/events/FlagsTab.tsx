import { Suspense, useState } from 'react'
import { Card, Checkbox, Flex, InputNumber, Space, Spin, Table, type TableColumnsType } from 'antd'
import type { EventFlag, SaveEvents } from '@pkhex-everywhere/engine'
import { useEvents, useQuery } from '@pkhex-everywhere/react'
import { useTranslation } from '../../i18n'
import { humanize, useEventFilters } from './useEventFilters'
import { useEventEdit } from './useEventEdit'

export function FlagsTab({ events }: { events: SaveEvents }) {
  const { t } = useTranslation()
  const { setFlag } = useEvents()
  const edit = useEventEdit()
  const { filtered, filters } = useEventFilters(events.flags)
  const [index, setIndex] = useState<number | null>(0)

  const columns: TableColumnsType<EventFlag> = [
    {
      title: t('events.flags.set', 'Set'),
      key: 'value',
      width: 60,
      render: (_: unknown, flag: EventFlag) => (
        <Checkbox checked={flag.value} onChange={(e) => edit(() => setFlag(flag.index, e.target.checked))} />
      ),
    },
    { title: '#', dataIndex: 'index', width: 80 },
    { title: t('table.name', 'Name'), dataIndex: 'name' },
    { title: t('events.flags.category', 'Category'), dataIndex: 'category', render: humanize },
  ]

  return (
    <Flex vertical gap={16}>
      {filters}
      <Table
        rowKey="index"
        dataSource={filtered}
        columns={columns}
        size="small"
        scroll={{ x: 'max-content' }}
        pagination={{ defaultPageSize: 20 }}
      />
      <Card size="small" title={t('events.flags.editByIndex', 'Edit by index')}>
        <Space align="center">
          <InputNumber<number> min={0} max={events.flagCount - 1} precision={0} value={index} onChange={setIndex} />
          {index !== null && (
            <Suspense fallback={<Spin size="small" />}>
              <FlagAt index={index} />
            </Suspense>
          )}
        </Space>
      </Card>
    </Flex>
  )
}

function FlagAt({ index }: { index: number }) {
  const { t } = useTranslation()
  const value = useQuery('events.flag', index)
  const { setFlag } = useEvents()
  const edit = useEventEdit()

  return (
    <Checkbox checked={value} onChange={(e) => edit(() => setFlag(index, e.target.checked))}>
      {t('events.flags.set', 'Set')}
    </Checkbox>
  )
}
