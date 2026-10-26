import { DatePicker, Descriptions, Grid, InputNumber, Switch } from 'antd'
import type { DescriptionsProps } from 'antd'
import dayjs from 'dayjs'
import { draftHandle } from '@pkhex-everywhere/engine'
import { useQuery } from '@pkhex-everywhere/react'
import { ItemSelect } from '../../components/ItemSelect'
import { useTranslation } from '../../i18n'
import { ChoiceSelect } from './ChoiceSelect'
import { isLocked } from './locked'
import { useDraft } from './useDraft'

export function MetConditionsTab() {
  const { t } = useTranslation()
  const { details, submit } = useDraft()
  const options = useQuery('pokemon.options', draftHandle)
  const originGames = useQuery('game.originGames')
  const balls = useQuery('game.balls')
  const screens = Grid.useBreakpoint()

  const items: DescriptionsProps['items'] = [
    ...(originGames.length === 0
      ? []
      : [
          {
            key: 'version',
            label: t('met.originGame'),
            children: (
              <ChoiceSelect
                label={t('met.originGame')}
                choices={originGames}
                value={details.version}
                onChange={(version) => submit({ version })}
              />
            ),
          },
        ]),
    ...(options.metLocations.length === 0
      ? []
      : [
          {
            key: 'metLocation',
            label: t('met.location'),
            children: (
              <ChoiceSelect
                label={t('met.location')}
                choices={options.metLocations}
                value={details.metLocation}
                disabled={isLocked(options, 'metLocation')}
                onChange={(metLocation) => submit({ metLocation })}
              />
            ),
          },
          {
            key: 'metLevel',
            label: t('met.level'),
            children: (
              <InputNumber
                aria-label={t('met.level')}
                min={0}
                max={100}
                value={details.metLevel}
                onChange={(metLevel) => metLevel !== null && submit({ metLevel })}
              />
            ),
          },
        ]),
    ...(balls.length === 0
      ? []
      : [
          {
            key: 'ball',
            label: t('met.capturedWith'),
            children: <ItemSelect items={balls} label={t('met.capturedWith')} value={details.ball} onChange={(ball) => submit({ ball: ball.id })} />,
          },
        ]),
    ...(details.metDate === null
      ? []
      : [
          {
            key: 'metDate',
            label: t('met.date'),
            children: (
              <DatePicker
                aria-label={t('met.date')}
                format="DD/MM/YYYY"
                allowClear={false}
                value={dayjs(details.metDate)}
                onChange={(date) => date && submit({ metDate: date.format('YYYY-MM-DD') })}
              />
            ),
          },
        ]),
    {
      key: 'fatefulEncounter',
      label: t('met.fatefulEncounter'),
      children: (
        <Switch
          aria-label={t('met.fatefulEncounter')}
          checked={details.fatefulEncounter}
          onChange={(fatefulEncounter) => submit({ fatefulEncounter })}
        />
      ),
    },
  ]

  return (
    <Descriptions
      bordered
      size="small"
      layout={screens.sm ? 'horizontal' : 'vertical'}
      column={{ xs: 1, sm: 2, md: 3 }}
      items={items}
    />
  )
}
