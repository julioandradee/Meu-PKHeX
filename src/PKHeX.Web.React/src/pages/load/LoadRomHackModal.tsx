import { useRef, useState, type ChangeEvent } from 'react'
import { Modal, Select } from 'antd'
import { useQuery } from '@pkhex-everywhere/react'
import { useTranslation } from '../../i18n'
import { SaveFileDrop } from './SaveFileDrop'
import { useLoadSave } from './useLoadSave'

export function LoadRomHackModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const formats = useQuery('game.formats')
  const { openFile } = useLoadSave()
  const [formatId, setFormatId] = useState<string>()
  const fileInput = useRef<HTMLInputElement>(null)

  const openSave = async (file: File) => {
    if (formatId && (await openFile(file, formatId))) onClose()
  }

  const loadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) await openSave(file)
  }

  return (
    <Modal
      open
      title={t('load.loadRomHack', 'Load ROM Hack')}
      okText={t('load.openSaveFile', 'Open save file...')}
      onOk={() => fileInput.current?.click()}
      onCancel={onClose}
      okButtonProps={{ disabled: !formatId }}
      modalRender={(content) => <SaveFileDrop onOpen={openSave} disabled={!formatId}>{content}</SaveFileDrop>}
    >
      <Select
        showSearch={{ optionFilterProp: 'label' }}
        placeholder={t('load.romHacks.search', 'Search ROM hacks')}
        aria-label={t('load.romHacks.aria', 'ROM hack')}
        options={formats.map((format) => ({ value: format.id, label: format.name }))}
        value={formatId}
        onChange={setFormatId}
        style={{ width: '100%' }}
      />
      <input ref={fileInput} type="file" hidden onChange={loadFile} />
    </Modal>
  )
}
