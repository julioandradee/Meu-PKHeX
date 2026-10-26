import { CopyOutlined } from '@ant-design/icons'
import { useCopyShowdown } from '../hooks/useCopyShowdown'
import { useSupports } from '../hooks/useSupports'
import { openCalculator } from '../host'
import { useTranslation } from '../i18n'
import { ButtonOrMenu } from './ButtonOrMenu'

interface ShowdownActionsProps {
  showdown: () => Promise<string>
  description: string
}

export function ShowdownActions({ showdown, description }: ShowdownActionsProps) {
  const { t } = useTranslation()
  const copyShowdown = useCopyShowdown()
  const supported = useSupports('showdown')
  if (!supported) return null
  return (
    <ButtonOrMenu
      actions={[
        {
          key: 'calculator',
          label: t('actions.calculator', 'Calculator'),
          type: 'primary',
          onClick: async () => openCalculator(await showdown()),
        },
        {
          key: 'showdown',
          label: t('actions.showdown', 'Showdown'),
          icon: <CopyOutlined />,
          onClick: async () => copyShowdown(await showdown(), description),
        },
      ]}
    />
  )
}
