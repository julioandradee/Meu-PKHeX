import { useEffect, useMemo, useState } from 'react'
import { SearchOutlined } from '@ant-design/icons'
import { App, Button, Flex, Input, Modal, Segmented, Select, Space, Typography, type TableColumnsType } from 'antd'
import {
  EngineError,
  type PokemonHandle,
  type PokemonSummary,
  type TransferOffer,
  type TransferPreview,
  type TransferSummary,
} from '@pkhex-everywhere/engine'
import { useEngine } from '@pkhex-everywhere/react'
import { gameName } from '../../capabilities'
import { PokemonTable } from '../../components/PokemonTable'
import { downloadFile } from '../../host'
import { useTranslation } from '../../i18n'
import { boxColumns } from './boxColumns'
import { describeChange, refusalReasons } from './transferLabels'
import { transferPick } from './transferPick'

type View = 'party' | 'box'

const handleKey = (at: PokemonHandle) => JSON.stringify(at)
const pickKey = (pokemon: PokemonSummary) => handleKey(pokemon.at)

function previewColumn(preview: TransferPreview | undefined): TableColumnsType<PokemonSummary>[number] {
  return {
    key: 'transfer',
    render: (_, pokemon) => {
      const key = pickKey(pokemon)
      const refused = preview?.refused.find((refusal) => handleKey(refusal.at) === key)
      const offered = preview?.offers.find((offer) => pickKey(offer.from) === key)
      return (
        <div style={{ maxWidth: 280 }}>
          {refused ? (
            <Typography.Text type="danger">{refusalReasons[refused.reason]}</Typography.Text>
          ) : (
            offered?.changes.map((change, index) => (
              <Typography.Text key={index} type="secondary" style={{ display: 'block' }}>
                {describeChange(change)}
              </Typography.Text>
            ))
          )}
        </div>
      )
    },
  }
}

export function TransferPicker({ transfer, onClose }: { transfer: TransferSummary; onClose: () => Promise<void> }) {
  const engine = useEngine()
  const { notification } = App.useApp()
  const { t } = useTranslation()
  const [view, setView] = useState<View>('party')
  const [partnerPokemon, setPartnerPokemon] = useState<PokemonSummary[]>([])
  const [pickedKeys, setPickedKeys] = useState<string[]>([])
  const [previewed, setPreviewed] = useState<{ of: TransferOffer; preview: TransferPreview }>()
  const [moving, setMoving] = useState(false)
  const [search, setSearch] = useState('')
  const [boxFilter, setBoxFilter] = useState<string>('all')

  useEffect(() => {
    let current = true
    void engine.transfer.partnerBoxes().then((pokemon) => current && setPartnerPokemon(pokemon))
    return () => {
      current = false
    }
  }, [engine])

  const partnerBoxes = useMemo(() => {
    return partnerPokemon.filter((p) => p.at.source === 'box')
  }, [partnerPokemon])

  const boxOptions = useMemo(() => {
    const boxSet = new Set<number>()
    for (const p of partnerBoxes) {
      if (typeof p.at.box === 'number') {
        boxSet.add(p.at.box + 1)
      }
    }
    const maxBox = Math.max(1, ...boxSet)
    const options = [{ value: 'all', label: t('box.allBoxes', 'Todas as Caixas') }]
    for (let i = 1; i <= maxBox; i++) {
      const count = partnerBoxes.filter((p) => (p.at.box ?? 0) + 1 === i).length
      options.push({
        value: String(i),
        label: `${t('box.boxLabel', 'Caixa')} ${i}${count > 0 ? ` (${count})` : ''}`,
      })
    }
    return options
  }, [partnerBoxes, t])

  const displayed = useMemo(() => {
    let list = partnerPokemon.filter((pokemon) => pokemon.at.source === view)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((p) => {
        const matchesSpecies = p.species.toLowerCase().includes(q)
        const matchesNickname = p.nickname ? p.nickname.toLowerCase().includes(q) : false
        return matchesSpecies || matchesNickname
      })
    }
    if (view === 'box' && boxFilter !== 'all') {
      const targetBox = Number(boxFilter)
      list = list.filter((p) => (p.at.box ?? 0) + 1 === targetBox)
    }
    return list
  }, [partnerPokemon, view, search, boxFilter])

  const picked = useMemo(
    () => partnerPokemon.filter((pokemon) => pickedKeys.includes(pickKey(pokemon))),
    [partnerPokemon, pickedKeys],
  )

  const offer = useMemo<TransferOffer>(() => ({ send: [], receive: picked.map((pokemon) => pokemon.at) }), [picked])

  useEffect(() => {
    if (offer.receive.length === 0) return
    let current = true
    void engine.transfer.preview(offer).then((preview) => current && setPreviewed({ of: offer, preview }))
    return () => {
      current = false
    }
  }, [engine, offer])

  const preview = previewed?.of === offer ? previewed.preview : undefined
  const pick = transferPick(offer.receive, transfer.room, preview)

  const changePicked = (rows: PokemonSummary[], selectedKeys?: (string | number)[]) => {
    if (selectedKeys) {
      setPickedKeys(selectedKeys.map(String))
      return
    }
    const newDisplayedKeys = rows.map(pickKey)
    setPickedKeys((prevKeys) => [
      ...prevKeys.filter((key) => !displayed.some((pokemon) => pickKey(pokemon) === key)),
      ...newDisplayedKeys,
    ])
  }

  const move = async () => {
    setMoving(true)
    try {
      const result = await engine.transfer.commit(offer)
      notification.success({
        title: `${result.arrived.length} Pokémon moved to your box`,
        description: 'Export this save from the Save page to keep them.',
        actions: (
          <Button type="link" onClick={() => downloadFile(result.partner.bytes, result.partner.fileName)}>
            {`Download ${result.partner.fileName}`}
          </Button>
        ),
      })
      await onClose()
    } catch (error) {
      if (!(error instanceof EngineError)) throw error
      notification.error({ title: error.message })
    } finally {
      setMoving(false)
    }
  }

  return (
    <Modal
      open
      width={720}
      title={
        <Flex vertical>
          {`Transfer from ${transfer.partner.fileName}`}
          <Typography.Text type="secondary" style={{ fontWeight: 'normal' }}>
            {`${gameName(transfer.partner)} · ${transfer.trainer.name}`}
          </Typography.Text>
        </Flex>
      }
      onCancel={onClose}
      footer={
        <Flex justify="space-between" align="center" gap={8} wrap>
          <Typography.Text type="secondary">
            {`${pick.selected} selected · ${pick.freeSlots} free slots${pick.refused ? ` · ${pick.refused} can't move` : ''}`}
          </Typography.Text>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" disabled={!pick.canMove} loading={moving} onClick={move}>
              {`Move ${pick.selected} here`}
            </Button>
          </Space>
        </Flex>
      }
    >
      <Flex vertical gap={12}>
        <Segmented<View>
          options={[
            { label: 'Party', value: 'party' },
            { label: 'Box', value: 'box' },
          ]}
          value={view}
          onChange={setView}
        />
        <Flex align="center" gap={10} wrap="wrap">
          <Input
            prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
            placeholder={t('box.searchPlaceholder', 'Buscar Pokémon...')}
            allowClear
            style={{ width: 190 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {view === 'box' && (
            <Select
              value={boxFilter}
              onChange={setBoxFilter}
              options={boxOptions}
              style={{ minWidth: 155 }}
            />
          )}
        </Flex>
        <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
          <PokemonTable
            pokemon={displayed}
            extraColumns={[...(view === 'box' ? boxColumns : []), previewColumn(preview)]}
            actions={false}
            selected={picked}
            onSelectedChange={changePicked}
          />
        </div>
      </Flex>
    </Modal>
  )
}

