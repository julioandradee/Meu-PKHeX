import { Flex } from 'antd'
import { useEngine, useParty } from '@pkhex-everywhere/react'
import { PageHeader } from '../../components/PageHeader'
import { PokemonTable } from '../../components/PokemonTable'
import { ShowdownActions } from '../../components/ShowdownActions'
import { useTranslation } from '../../i18n'

export default function PartyPage() {
  const { party } = useParty()
  const engine = useEngine()
  const { t } = useTranslation()

  return (
    <Flex vertical gap={20}>
      <PageHeader
        title={t('party.title', 'Party')}
        extra={<ShowdownActions showdown={() => engine.party.showdown()} description={`${party.length} entries`} />}
      />
      <PokemonTable pokemon={party} />
    </Flex>
  )
}
