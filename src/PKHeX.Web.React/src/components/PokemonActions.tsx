import { Dropdown } from 'antd'
import type { PokemonSummary } from '@pkhex-everywhere/engine'
import { useEngine } from '@pkhex-everywhere/react'
import { openCalculator, useNavigate } from '../host'
import { useCopyShowdown } from '../hooks/useCopyShowdown'
import { useSupports } from '../hooks/useSupports'
import { useTranslation } from '../i18n'
import { routes } from '../routes'

interface PokemonActionsProps {
  pokemon: PokemonSummary
}

export function PokemonActions({ pokemon }: PokemonActionsProps) {
  const engine = useEngine()
  const navigate = useNavigate()
  const copyShowdown = useCopyShowdown()
  const showdownSupported = useSupports('showdown')
  const { t } = useTranslation()
  const showdown = () => engine.pokemon.showdown(pokemon.at)

  return (
    <Dropdown.Button
      type="link"
      trigger={['click']}
      onClick={() => navigate(routes.pokemon(pokemon))}
      menu={{
        items: [
          ...(pokemon.editable
            ? [{ key: 'clone', label: t('actions.clone', 'Clone'), onClick: () => navigate(routes.clonePokemon(pokemon)) }]
            : []),
          ...(showdownSupported
            ? [
                {
                  key: 'calculator',
                  label: t('actions.calculator', 'Calculator'),
                  onClick: async () => openCalculator(await showdown()),
                },
                {
                  key: 'showdown',
                  label: t('actions.showdown', 'Showdown'),
                  onClick: async () => copyShowdown(await showdown(), pokemon.species),
                },
              ]
            : []),
        ],
      }}
    >
      {t('actions.view', 'View')}
    </Dropdown.Button>
  )
}
