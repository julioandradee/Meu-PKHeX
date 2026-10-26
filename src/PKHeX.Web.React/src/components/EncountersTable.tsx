import { Button, Table, type TableColumnsType } from 'antd'
import type { EncounterRow } from '@pkhex-everywhere/engine'
import { useTranslation } from '../i18n'
import { ItemIcon } from './ItemIcon'
import { PokemonSprite } from './PokemonSprite'
import { NumberFilter } from './filters/NumberFilter'
import { containsText } from './filters/containsText'
import { TextFilter } from './filters/TextFilter'

const levels = (encounter: EncounterRow) => encounter.levelRange.split('-').map(Number)

interface EncountersTableProps {
  encounters: EncounterRow[]
  adding?: number
  onAdd: (encounter: EncounterRow) => void
}

export function EncountersTable({ encounters, adding, onAdd }: EncountersTableProps) {
  const { t } = useTranslation()

  const columns: TableColumnsType<EncounterRow> = [
    {
      key: 'sprite',
      width: 80,
      render: (_: unknown, encounter: EncounterRow) => <PokemonSprite pokemon={encounter} />,
    },
    {
      title: t('encounters.species', 'Species'),
      dataIndex: 'species',
      sorter: (a, b) => a.species.localeCompare(b.species),
      filterDropdown: (props) => <TextFilter {...props} placeholder={t('encounters.species', 'Species')} />,
      onFilter: (value, encounter) => containsText(encounter.species, value),
    },
    {
      title: t('encounters.encounter', 'Encounter'),
      dataIndex: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      filterDropdown: (props) => <TextFilter {...props} placeholder={t('encounters.encounter', 'Encounter')} />,
      onFilter: (value, encounter) => containsText(encounter.name, value),
    },
    {
      title: t('encounters.ballEgg', 'Ball/Egg'),
      key: 'ball',
      render: (_: unknown, encounter: EncounterRow) => (
        <>
          {encounter.isEgg && `🥚 ${t('encounters.egg', 'Egg')}`}
          {encounter.ball && <ItemIcon name={encounter.ball} />}
        </>
      ),
    },
    {
      title: t('box.levelPrefix', 'Lvl'),
      dataIndex: 'levelRange',
      sorter: (a, b) => levels(a)[0] - levels(b)[0],
      filterDropdown: (props) => <NumberFilter {...props} placeholder={t('table.level', 'Level')} min={1} max={100} />,
      onFilter: (value, encounter) => {
        const [min, max = min] = levels(encounter)
        return min <= Number(value) && Number(value) <= max
      },
    },
    {
      title: t('encounters.location', 'Location'),
      dataIndex: 'location',
      sorter: (a, b) => a.location.localeCompare(b.location),
      filterDropdown: (props) => <TextFilter {...props} placeholder={t('encounters.location', 'Location')} />,
      onFilter: (value, encounter) => containsText(encounter.location, value),
    },
    {
      title: t('encounters.game', 'Game'),
      dataIndex: 'version',
    },
    {
      title: t('table.action', 'Action'),
      key: 'action',
      render: (_: unknown, encounter: EncounterRow) => (
        <Button
          type="link"
          loading={adding === encounter.index}
          disabled={adding !== undefined}
          onClick={() => onAdd(encounter)}
        >
          {t('encounters.addToBox', 'Add to box')}
        </Button>
      ),
    },
  ]

  return (
    <Table
      rowKey="index"
      dataSource={encounters}
      columns={columns}
      size="small"
      scroll={{ x: 'max-content' }}
      pagination={{ hideOnSinglePage: true }}
    />
  )
}
