import { useState } from 'react'
import { Modal, Radio, Typography } from 'antd'
import { useTranslation } from '../../i18n'
import type { FormatChoice } from './useLoadSave'

const pkhexFormatId = 'pkhex'

interface FormatPickerModalProps {
  choice: FormatChoice
  onChoose: (formatId: string) => void
  onCancel: () => void
}

export function FormatPickerModal({ choice, onChoose, onCancel }: FormatPickerModalProps) {
  const { t } = useTranslation()
  const [formatId, setFormatId] = useState<string>()

  return (
    <Modal
      open
      title={t('load.romHacks.isRomHack', 'Is this save from a ROM hack?')}
      okText={t('common.open', 'Open')}
      onOk={() => formatId && onChoose(formatId)}
      onCancel={onCancel}
      okButtonProps={{ disabled: !formatId }}
    >
      <Typography.Paragraph>
        {choice.candidates.length
          ? t('load.romHacks.candidatesNotice', "'{0}' might be from one of these games.").replace('{0}', choice.file.name)
          : t('load.romHacks.unsupportedNotice', "'{0}' has Pokémon or moves that {1} doesn't have. It might be from a ROM hack we don't support.")
              .replace('{0}', choice.file.name)
              .replace('{1}', choice.pkhexGame ?? '')}
      </Typography.Paragraph>
      <Radio.Group
        vertical
        aria-label={t('load.romHacks.game', 'Game')}
        value={formatId}
        onChange={(event) => setFormatId(event.target.value as string)}
        options={[
          ...choice.candidates.map((format) => ({ value: format.id, label: format.name })),
          ...(choice.pkhexGame ? [{ value: pkhexFormatId, label: `${t('load.romHacks.noIts', "No, it's")} ${choice.pkhexGame}` }] : []),
        ]}
      />
    </Modal>
  )
}
