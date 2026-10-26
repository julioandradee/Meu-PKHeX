import type { ReactNode } from 'react'
import { Flex, Tabs } from 'antd'
import { draftHandle } from '@pkhex-everywhere/engine'
import { usePokemon, usePokemonDetails } from '@pkhex-everywhere/react'
import { PageHeader } from '../../components/PageHeader'
import { PokemonImage } from '../../components/PokemonImage'
import { DescriptionTab } from './DescriptionTab'
import { LegalityBanner } from './LegalityBanner'
import { MovesTab } from './MovesTab'
import { TrainerTab } from './TrainerTab'
import { MetConditionsTab } from './MetConditionsTab'
import { StatsTab } from './StatsTab'

import { useTranslation } from '../../i18n'

interface DraftEditorProps {
  actions: ReactNode
}

export function DraftEditor({ actions }: DraftEditorProps) {
  const { pokemon } = usePokemon(draftHandle)
  const { details } = usePokemonDetails(draftHandle)
  const { t } = useTranslation()

  return (
    <Flex vertical gap={20}>
      <PageHeader title={pokemon.nickname || pokemon.species || 'Pokémon'} extra={<PokemonImage pokemon={pokemon} />} />
      {details.legality && <LegalityBanner legality={details.legality} />}
      <Tabs
        items={[
          { key: 'description', label: t('editor.tabs.description', 'Description'), children: <DescriptionTab /> },
          { key: 'metConditions', label: t('editor.tabs.metConditions', 'Met Conditions'), children: <MetConditionsTab /> },
          { key: 'stats', label: t('editor.tabs.stats', 'Stats'), children: <StatsTab /> },
          { key: 'moves', label: t('editor.tabs.moves', 'Moves'), children: <MovesTab /> },
          { key: 'trainer', label: t('editor.tabs.trainer', 'Trainer'), children: <TrainerTab /> },
        ]}
      />
      <Flex justify="end">{actions}</Flex>
    </Flex>
  )
}
