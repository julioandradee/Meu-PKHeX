import { CalculatorOutlined, CopyOutlined, FolderOpenOutlined, SwapOutlined } from '@ant-design/icons'
import type { ButtonOrMenuAction } from '../../components/ButtonOrMenu'

type Handler = ButtonOrMenuAction['onClick']

interface BoxActionHandlers {
  add: Handler
  load: Handler
  calculator: Handler
  showdown: Handler
  transfer: Handler
}

export type TranslateFn = (key: string, fallback?: string) => string

export function boxActions(
  supports: { encounters: boolean; showdown: boolean },
  handlers: BoxActionHandlers,
  t: TranslateFn = (_key, fallback) => fallback ?? _key,
): ButtonOrMenuAction[] {
  return [
    ...(supports.encounters ? [{ key: 'add', label: t('actions.add', 'Add'), type: 'primary' as const, onClick: handlers.add }] : []),
    { key: 'load', label: t('actions.load', 'Load *.pk'), icon: <FolderOpenOutlined />, onClick: handlers.load },
    ...(supports.showdown
      ? [
          { key: 'calculator', label: t('actions.calculator', 'Calculator'), icon: <CalculatorOutlined />, onClick: handlers.calculator },
          { key: 'showdown', label: t('actions.showdown', 'Showdown'), icon: <CopyOutlined />, onClick: handlers.showdown },
        ]
      : []),
    { key: 'transfer', label: t('actions.transfer', 'Transfer'), icon: <SwapOutlined />, onClick: handlers.transfer },
  ]
}
