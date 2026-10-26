import { Alert, Button, Descriptions, Flex, Grid, Typography } from 'antd'
import type { DescriptionsProps } from 'antd'
import type { PokemonHandle } from '@pkhex-everywhere/engine'
import { useEngine, usePokemon, usePokemonDetails, useQuery } from '@pkhex-everywhere/react'
import { PageHeader } from '../../components/PageHeader'
import { PokemonImage } from '../../components/PokemonImage'
import { downloadFile } from '../../host'
import { useTranslation } from '../../i18n'

interface ReadOnlyPokemonProps {
  at: PokemonHandle
}

export function ReadOnlyPokemon({ at }: ReadOnlyPokemonProps) {
  const { t } = useTranslation()
  const engine = useEngine()
  const { pokemon } = usePokemon(at)
  const { details } = usePokemonDetails(at)
  const options = useQuery('pokemon.options', at)
  const balls = useQuery('game.balls')
  const screens = Grid.useBreakpoint()

  const nameOf = (choices: { id: number; name: string }[], id: number) => choices.find((choice) => choice.id === id)?.name ?? `#${id}`

  const exportFile = async () => {
    const { bytes, fileName } = await engine.pokemon.export(at)
    downloadFile(bytes, fileName)
  }

  const items: DescriptionsProps['items'] = [
    { key: 'species', label: t('editor.fields.species', 'Species'), children: pokemon.species },
    { key: 'nickname', label: t('editor.fields.nickname', 'Nickname'), children: details.nickname },
    { key: 'level', label: t('editor.fields.level', 'Level'), children: details.level },
    {
      key: 'pid',
      label: 'PID',
      children: <Typography.Text copyable>{details.pid.toString(16).toUpperCase().padStart(8, '0')}</Typography.Text>,
    },
    { key: 'shiny', label: t('editor.fields.shiny', 'Shiny'), children: details.isShiny ? 'Yes' : 'No' },
    { key: 'heldItem', label: t('editor.fields.heldItem', 'Held Item'), children: nameOf(options.heldItems, details.heldItem) },
    { key: 'ball', label: t('editor.fields.ball', 'Ball'), children: nameOf(balls, details.ball) },
    { key: 'trainer', label: t('trainer.originalTrainer', 'Original Trainer'), children: `${details.originalTrainerName} (${details.trainerId})` },
    { key: 'metLevel', label: t('met.level', 'Met Level'), children: details.metLevel },
    {
      key: 'moves',
      label: t('editor.tabs.moves', 'Moves'),
      children: details.moves
        .filter((move) => move.id !== 0)
        .map((move) => move.name)
        .join(', '),
    },
  ]

  return (
    <Flex vertical gap={20}>
      <PageHeader title={pokemon.nickname || pokemon.species || 'Pokémon'} extra={<PokemonImage pokemon={pokemon} />} />
      <Alert type="info" showIcon title={t('editor.readOnlyNotice', "This Pokémon's species is unknown, so it can't be edited.")} />
      <Descriptions
        bordered
        size="small"
        layout={screens.sm ? 'horizontal' : 'vertical'}
        column={{ xs: 1, sm: 2, md: 3 }}
        items={items}
      />
      <Flex justify="end">
        <Button onClick={() => void exportFile()}>{t('editor.exportPk', 'Export *.pk')}</Button>
      </Flex>
    </Flex>
  )
}
