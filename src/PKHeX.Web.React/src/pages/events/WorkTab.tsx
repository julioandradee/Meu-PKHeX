import { useState } from 'react'
import { Flex, InputNumber, Select, Table, type TableColumnsType } from 'antd'
import type { EventWork, SaveEvents } from '@pkhex-everywhere/engine'
import { useEvents } from '@pkhex-everywhere/react'
import { useTranslation } from '../../i18n'
import { humanize, useEventFilters } from './useEventFilters'
import { useEventEdit } from './useEventEdit'

export function WorkTab({ events }: { events: SaveEvents }) {
  const { t } = useTranslation()
  const { filtered, filters } = useEventFilters(events.work)

  const columns: TableColumnsType<EventWork> = [
    { title: '#', dataIndex: 'index', width: 80 },
    { title: t('table.name', 'Name'), dataIndex: 'name' },
    { title: t('events.flags.category', 'Category'), dataIndex: 'category', render: humanize },
    {
      title: t('events.work.value', 'Value'),
      key: 'value',
      width: 220,
      render: (_: unknown, work: EventWork) => <WorkValue key={`${work.index}-${work.value}`} work={work} min={events.workMin} max={events.workMax} />,
    },
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
    </Flex>
  )
}

function WorkValue({ work, min, max }: { work: EventWork; min: number; max: number }) {
  const { t } = useTranslation()
  const { setWork } = useEvents()
  const edit = useEventEdit()
  const [draft, setDraft] = useState<number | null>(work.value)

  const save = (value: number | null) => {
    if (value === null || value === work.value) return
    void edit(() => setWork(work.index, value))
  }

  if (work.options.length === 0)
    return (
      <InputNumber<number>
        min={min}
        max={max}
        precision={0}
        value={draft}
        onChange={setDraft}
        onBlur={() => save(draft)}
        onPressEnter={() => save(draft)}
      />
    )

  const options = work.options.some((option) => option.value === work.value)
    ? work.options
    : [{ name: `${t('trainer.other', 'Other')} (${work.value})`, value: work.value }, ...work.options]

  return (
    <Select
      value={work.value}
      onChange={save}
      options={options.map((option) => ({ value: option.value, label: option.name }))}
      style={{ width: 200 }}
    />
  )
}
