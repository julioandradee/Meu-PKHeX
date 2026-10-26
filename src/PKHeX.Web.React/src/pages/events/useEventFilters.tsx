import { useState } from 'react'
import { Input, Select, Space } from 'antd'
import { useTranslation } from '../../i18n'

interface Filterable {
  name: string
  category: string
}

export const humanize = (category: string) => category.replace(/(?<=[a-z])(?=[A-Z])/g, ' ')

export function useEventFilters<T extends Filterable>(entries: T[]) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>()

  const categories = [...new Set(entries.map((entry) => entry.category))]
  const term = search.trim().toLowerCase()
  const filtered = entries.filter(
    (entry) => (!term || entry.name.toLowerCase().includes(term)) && (!category || entry.category === category),
  )

  const filters = (
    <Space wrap>
      <Input
        placeholder={t('events.filters.search', 'Search')}
        allowClear
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: 260 }}
      />
      <Select
        placeholder={t('events.filters.allCategories', 'All categories')}
        allowClear
        value={category}
        onChange={setCategory}
        options={categories.map((value) => ({ value, label: humanize(value) }))}
        style={{ width: 200 }}
      />
    </Space>
  )

  return { filtered, filters }
}
