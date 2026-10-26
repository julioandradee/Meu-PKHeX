import { useState } from 'react'
import { Checkbox, Descriptions, Flex, Grid } from 'antd'
import { draftHandle } from '@pkhex-everywhere/engine'
import { useQuery } from '@pkhex-everywhere/react'
import { useTranslation } from '../../i18n'
import { ChoiceSelect } from './ChoiceSelect'
import { moveChoices } from './moveChoices'
import { useDraft } from './useDraft'

export function MovesTab() {
  const { t } = useTranslation()
  const { details, submit } = useDraft()
  const options = useQuery('pokemon.options', draftHandle)
  const allMoves = useQuery('game.moves')
  const [showAllMoves, setShowAllMoves] = useState(false)
  const layout = Grid.useBreakpoint().sm ? 'horizontal' : 'vertical'

  const choicesFor = moveChoices(details.moves, showAllMoves ? allMoves : options.moves)

  const change = (index: number, id: number) =>
    submit({ moves: details.moves.map((move, i) => (i === index ? id : move.id)) })

  return (
    <Flex vertical gap={20}>
      <Checkbox checked={showAllMoves} onChange={(event) => setShowAllMoves(event.target.checked)}>
        {t('moves.showAll')}
      </Checkbox>
      {details.moves.map((slot, index) => (
        <Descriptions
          key={index}
          title={`${t('moves.move')} ${index + 1}`}
          bordered
          size="small"
          layout={layout}
          items={[
            {
              key: 'move',
              label: t('moves.move'),
              style: { maxWidth: 250 },
              children: (
                <ChoiceSelect
                  label={`${t('moves.move')} ${index + 1}`}
                  choices={choicesFor(slot)}
                  value={slot.id}
                  onChange={(id) => change(index, id)}
                />
              ),
            },
            { key: 'pp', label: t('moves.pp'), children: `${slot.pp}/${slot.maxPp}` },
          ]}
        />
      ))}
    </Flex>
  )
}
