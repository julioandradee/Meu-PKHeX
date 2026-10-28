import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons'
import { App, Button, Flex, Input, Select } from 'antd'
import type { PokemonSummary } from '@pkhex-everywhere/engine'
import { useBox, useEngine, useLoadedGame } from '@pkhex-everywhere/react'
import { ButtonOrMenu } from '../../components/ButtonOrMenu'
import { PageHeader } from '../../components/PageHeader'
import { PokemonTable } from '../../components/PokemonTable'
import { useCopyShowdown } from '../../hooks/useCopyShowdown'
import { useExportPokemon } from '../../hooks/useExportPokemon'
import { useSupports } from '../../hooks/useSupports'
import { openCalculator, useNavigate } from '../../host'
import { useTranslation } from '../../i18n'
import { routes } from '../../routes'
import { boxActions } from './boxActions'
import { getBoxColumns } from './boxColumns'
import { ImportedPokemonModal } from './ImportedPokemonModal'
import { TransferModal } from './TransferModal'
import { useLoadPokemonFile } from './useLoadPokemonFile'

export default function BoxPage() {
  const { box } = useBox()
  const { game } = useLoadedGame()
  const engine = useEngine()
  const navigate = useNavigate()
  const copyShowdown = useCopyShowdown()
  const encountersSupported = useSupports('encounters')
  const showdownSupported = useSupports('showdown')
  const { notification } = App.useApp()
  const { loadFiles, importedPokemon, failedFiles, clearImported } = useLoadPokemonFile()
  const fileInput = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()
  const { exportMultiple, exporting } = useExportPokemon()

  const [selected, setSelected] = useState<PokemonSummary[]>([])
  const [transferring, setTransferring] = useState(false)
  const [search, setSearch] = useState('')
  const [boxFilter, setBoxFilter] = useState<string>('all')
  const [levelFilter, setLevelFilter] = useState<string>('all')

  const boxOptions = useMemo(() => {
    const boxSet = new Set<number>()
    for (const p of box) {
      if (typeof p.at.box === 'number') {
        boxSet.add(p.at.box + 1)
      }
    }
    const maxBox = Math.max(1, ...boxSet)
    const options = [{ value: 'all', label: t('box.allBoxes', 'Todas as Caixas') }]
    for (let i = 1; i <= maxBox; i++) {
      const count = box.filter((p) => (p.at.box ?? 0) + 1 === i).length
      options.push({
        value: String(i),
        label: `${t('box.boxLabel', 'Caixa')} ${i}${count > 0 ? ` (${count})` : ''}`,
      })
    }
    return options
  }, [box, t])

  const levelOptions = useMemo(
    () => [
      { value: 'all', label: t('box.allLevels', 'Todos os Níveis') },
      { value: '1-10', label: `${t('box.levelPrefix', 'Lvl')} 1 - 10` },
      { value: '11-20', label: `${t('box.levelPrefix', 'Lvl')} 11 - 20` },
      { value: '21-30', label: `${t('box.levelPrefix', 'Lvl')} 21 - 30` },
      { value: '31-40', label: `${t('box.levelPrefix', 'Lvl')} 31 - 40` },
      { value: '41-50', label: `${t('box.levelPrefix', 'Lvl')} 41 - 50` },
      { value: '+50', label: `${t('box.levelPrefix', 'Lvl')} +50` },
    ],
    [t],
  )

  const filteredBox = useMemo(() => {
    return box.filter((pokemon) => {
      // 1. Text search (species / nickname / pokedex #)
      const q = search.trim().toLowerCase()
      if (q) {
        const matchesSpecies = pokemon.species.toLowerCase().includes(q)
        const matchesNickname = pokemon.nickname ? pokemon.nickname.toLowerCase().includes(q) : false
        const cleanQ = q.replace(/^#/, '')
        const matchesDex =
          pokemon.speciesId !== null &&
          (String(pokemon.speciesId) === cleanQ ||
            String(pokemon.speciesId).padStart(4, '0').includes(cleanQ) ||
            String(pokemon.speciesId).padStart(3, '0').includes(cleanQ))
        if (!matchesSpecies && !matchesNickname && !matchesDex) return false
      }

      // 2. Box filter
      if (boxFilter !== 'all') {
        const targetBox = Number(boxFilter)
        if ((pokemon.at.box ?? 0) + 1 !== targetBox) return false
      }

      // 3. Level filter
      if (levelFilter !== 'all') {
        const lvl = pokemon.level
        if (levelFilter === '1-10' && (lvl < 1 || lvl > 10)) return false
        if (levelFilter === '11-20' && (lvl < 11 || lvl > 20)) return false
        if (levelFilter === '21-30' && (lvl < 21 || lvl > 30)) return false
        if (levelFilter === '31-40' && (lvl < 31 || lvl > 40)) return false
        if (levelFilter === '41-50' && (lvl < 41 || lvl > 50)) return false
        if (levelFilter === '+50' && lvl <= 50) return false
      }

      return true
    })
  }, [box, search, boxFilter, levelFilter])

  const openSelectedInCalculator = async () => {
    const showdown = selected.length
      ? (await Promise.all(selected.map((pokemon) => engine.pokemon.showdown(pokemon.at)))).join('\n\n')
      : await engine.box.showdown()
    openCalculator(showdown)
  }

  const copyBoxShowdown = async () => {
    if (box.length === 0) {
      notification.error({ title: t('box.noPokemon', 'No Pokémon found in your box') })
      return
    }
    await copyShowdown(await engine.box.showdown(), `${box.length} entries`)
  }

  const loadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      await loadFiles(files)
    }
    event.target.value = ''
  }

  return (
    <Flex vertical gap={20}>
      <PageHeader
        title={t('box.title', 'Box')}
        extra={
          <Flex align="center" gap={10} wrap="wrap">
            <Input
              prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
              placeholder={t('box.searchPlaceholder', 'Buscar Pokémon...')}
              allowClear
              style={{ width: 190 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              value={boxFilter}
              onChange={setBoxFilter}
              options={boxOptions}
              style={{ minWidth: 155 }}
            />
            <Select
              value={levelFilter}
              onChange={setLevelFilter}
              options={levelOptions}
              style={{ minWidth: 135 }}
            />
            {selected.length > 0 && (
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                loading={exporting}
                onClick={() => void exportMultiple(selected, 'box_pokemon.zip')}
              >
                {selected.length === 1
                  ? t('actions.exportSingle', 'Exportar (.pk)')
                  : t('actions.exportZip', 'Exportar ({0}) como .zip').replace('{0}', String(selected.length))}
              </Button>
            )}
            <ButtonOrMenu
              actions={boxActions(
                { encounters: encountersSupported, showdown: showdownSupported },
                {
                  add: () => navigate(routes.searchEncounter),
                  load: () => fileInput.current?.click(),
                  calculator: openSelectedInCalculator,
                  showdown: copyBoxShowdown,
                  transfer: () => setTransferring(true),
                },
                t,
              )}
            />
            <input
              ref={fileInput}
              type="file"
              hidden
              multiple
              accept=".pk,.pk1,.pk2,.pk3,.pk4,.pk5,.pk6,.pk7,.pk8,.pk9,.pb7,.pa8,.pa9,.ck3,.xk3,.zip"
              onChange={loadFile}
            />
          </Flex>
        }
      />
      <PokemonTable
        pokemon={filteredBox}
        extraColumns={getBoxColumns(t)}
        selected={selected}
        onSelectedChange={setSelected}
        batchExport="box_pokemon.zip"
        pageSize={50}
      />
      {transferring && game && <TransferModal game={game} onClose={() => setTransferring(false)} />}
      <ImportedPokemonModal
        open={importedPokemon.length > 0}
        imported={importedPokemon}
        failed={failedFiles}
        onClose={clearImported}
      />
    </Flex>
  )
}

