import { useState } from 'react'
import { DownloadOutlined } from '@ant-design/icons'
import { Button, Flex } from 'antd'
import type { PokemonSummary } from '@pkhex-everywhere/engine'
import { useEngine, useParty } from '@pkhex-everywhere/react'
import { PageHeader } from '../../components/PageHeader'
import { PokemonTable } from '../../components/PokemonTable'
import { ShowdownActions } from '../../components/ShowdownActions'
import { useExportPokemon } from '../../hooks/useExportPokemon'
import { useTranslation } from '../../i18n'

export default function PartyPage() {
  const { party } = useParty()
  const engine = useEngine()
  const { t } = useTranslation()
  const [selected, setSelected] = useState<PokemonSummary[]>([])
  const { exportMultiple, exporting } = useExportPokemon()

  return (
    <Flex vertical gap={20}>
      <PageHeader
        title={t('party.title', 'Party')}
        extra={
          <Flex align="center" gap={10} wrap="wrap">
            {selected.length > 0 && (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                loading={exporting}
                onClick={() => void exportMultiple(selected, 'party_pokemon.zip')}
              >
                {selected.length === 1
                  ? t('actions.exportSingle', 'Exportar (.pk)')
                  : t('actions.exportZip', 'Exportar ({0}) como .zip').replace('{0}', String(selected.length))}
              </Button>
            )}
            <ShowdownActions showdown={() => engine.party.showdown()} description={`${party.length} entries`} />
          </Flex>
        }
      />
      <PokemonTable
        pokemon={party}
        selected={selected}
        onSelectedChange={setSelected}
        batchExport="party_pokemon.zip"
        pagination={false}
      />
    </Flex>
  )
}

