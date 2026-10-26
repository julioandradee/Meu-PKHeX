import { Suspense, useRef, useState, type ChangeEvent, type CSSProperties } from 'react'
import { EllipsisOutlined, ExportOutlined, FolderOpenOutlined } from '@ant-design/icons'
import { Badge, Button, Descriptions, Dropdown, Flex, Space, type ButtonProps } from 'antd'
import type { SaveSummary } from '@pkhex-everywhere/engine'
import { useEngine, useLoadedGame, useQuery } from '@pkhex-everywhere/react'
import { gameName } from '../../capabilities'
import { AdSlot } from '../../components/AdSlot'
import { downloadFile, useNavigate } from '../../host'
import { useTranslation } from '../../i18n'
import { journey } from '../../layout/journey'
import { routes } from '../../routes'
import { FormatPickerModal } from './FormatPickerModal'
import { LoadRomHackModal } from './LoadRomHackModal'
import { PkhemuCard } from './PkhemuCard'
import { SaveFileDrop } from './SaveFileDrop'
import { cardGeneration } from './pkhemuInvite'
import { showRomHacksBadge } from './romHacksBadge'
import { useLoadSave } from './useLoadSave'

const topAdSlot = '5784199745'
const bottomAdSlot = '5148940774'
const swordVersionId = 44

export default function LoadPage() {
  const { game } = useLoadedGame()
  const { openFile, openDemo, formatChoice, chooseFormat, cancelFormatChoice } = useLoadSave()
  const fileInput = useRef<HTMLInputElement>(null)

  const openFilePicker = () => fileInput.current?.click()

  const loadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) await openFile(file)
  }

  return (
    <SaveFileDrop onOpen={openFile}>
      <Flex vertical align="center" gap={20} style={{ width: '100%' }}>
        <AdSlot slot={topAdSlot} format="horizontal" />
        {game ? (
          <LoadedGame key={`${game.fileName}|${game.version}|${game.format?.id}`} game={game} onOpen={openFilePicker} />
        ) : (
          <NoGame onOpen={openFilePicker} onDemo={openDemo} />
        )}
        <AdSlot slot={bottomAdSlot} format="horizontal" />
        <input ref={fileInput} type="file" hidden onChange={loadFile} />
        {formatChoice && <FormatPickerModal choice={formatChoice} onChoose={chooseFormat} onCancel={cancelFormatChoice} />}
      </Flex>
    </SaveFileDrop>
  )
}

function LoadedGame({ game, onOpen }: { game: SaveSummary; onOpen: () => void }) {
  const { t } = useTranslation()
  const engine = useEngine()
  const [exported, setExported] = useState(false)

  const exportSave = async () => {
    const { bytes, fileName } = await engine.game.export()
    downloadFile(bytes, fileName)
    setExported(true)
  }

  return (
    <>
      <Descriptions
        title={t('load.loadedGame')}
        bordered
        size="small"
        style={{ width: '100%' }}
        items={[
          { key: 'file', label: t('trainer.file'), children: game.fileName },
          { key: 'version', label: t('load.version', 'Version'), children: gameName(game) },
        ]}
      />
      <Flex vertical gap={20} style={{ width: '100%', maxWidth: 300 }}>
        <Button type="primary" icon={<ExportOutlined aria-hidden />} onClick={exportSave}>
          {t('load.export')}
        </Button>
        {exported && <PkhemuCard generation={cardGeneration(game)} onClose={() => setExported(false)} />}
        <OpenButton label={t('load.openNew')} onOpen={onOpen} />
      </Flex>
    </>
  )
}

function NoGame({ onOpen, onDemo }: { onOpen: () => void; onDemo: () => void }) {
  const { t } = useTranslation()
  const engine = useEngine()
  const navigate = useNavigate()
  const goHome = () => {
    journey.reachedHome()
    void navigate(routes.home)
  }
  const versions = useQuery('game.blankVersions')

  return (
    <Flex vertical align="center" gap={20} style={{ width: '100%', maxWidth: 300 }}>
      <Button style={{ minWidth: 150 }} onClick={goHome}>
        {t('menu.home')}
      </Button>
      <OpenButton label={t('actions.load')} type="primary" style={{ minWidth: 150 }} onOpen={onOpen} />
      <Space.Compact style={{ minWidth: 150 }}>
        <Button style={{ flexGrow: 1 }} onClick={() => engine.game.loadBlank(swordVersionId)}>
          {t('load.empty')}
        </Button>
        <Dropdown
          trigger={['click']}
          menu={{
            items: versions.map((version) => ({ key: version.id, label: version.name })),
            onClick: ({ key }) => engine.game.loadBlank(Number(key)),
            style: { maxHeight: 250, overflowY: 'auto' },
          }}
        >
          <Button icon={<EllipsisOutlined />} aria-label="Empty save versions" />
        </Dropdown>
      </Space.Compact>
      <Button style={{ minWidth: 150 }} onClick={onDemo}>
        {t('load.demo')}
      </Button>
    </Flex>
  )
}

interface OpenButtonProps {
  label: string
  type?: ButtonProps['type']
  style?: CSSProperties
  onOpen: () => void
}

function OpenButton({ label, type, style, onOpen }: OpenButtonProps) {
  const { t } = useTranslation()
  const [loadingRomHack, setLoadingRomHack] = useState(false)

  const buttons = (
    <Space.Compact style={style}>
      <Button type={type} icon={<FolderOpenOutlined aria-hidden />} style={{ flexGrow: 1 }} onClick={onOpen}>
        {label}
      </Button>
      <Dropdown
        trigger={['click']}
        menu={{
          items: [
            { key: 'open', label: t('load.openSaveFile') },
            { key: 'romHack', label: t('load.loadRomHack') },
          ],
          onClick: ({ key }) => (key === 'romHack' ? setLoadingRomHack(true) : onOpen()),
        }}
      >
        <Button type={type} icon={<EllipsisOutlined />} aria-label="More ways to open" />
      </Dropdown>
    </Space.Compact>
  )

  return (
    <>
      {showRomHacksBadge(new Date()) ? (
        <Badge
          count={t('load.romHacks.newBadge', 'New')}
          size="small"
          color="yellow"
          // antd sets the badge to width: fit-content, and Space.Compact items to z-index 2-4.
          styles={{
            root: { display: 'flex', flexDirection: 'column', width: 'auto' },
            indicator: { zIndex: 5, color: 'rgba(0, 0, 0, 0.88)' },
          }}
        >
          {buttons}
        </Badge>
      ) : (
        buttons
      )}
      {loadingRomHack && (
        <Suspense fallback={null}>
          <LoadRomHackModal onClose={() => setLoadingRomHack(false)} />
        </Suspense>
      )}
    </>
  )
}
