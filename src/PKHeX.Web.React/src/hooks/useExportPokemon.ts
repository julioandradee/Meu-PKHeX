import { useState } from 'react'
import { App } from 'antd'
import JSZip from 'jszip'
import type { PokemonSummary } from '@pkhex-everywhere/engine'
import { useEngine } from '@pkhex-everywhere/react'
import { downloadFile } from '../host'
import { useTranslation } from '../i18n'

export function useExportPokemon() {
  const engine = useEngine()
  const { notification } = App.useApp()
  const { t } = useTranslation()
  const [exporting, setExporting] = useState(false)

  const exportSingle = async (pokemon: PokemonSummary) => {
    try {
      const { bytes, fileName } = await engine.pokemon.export(pokemon.at)
      downloadFile(bytes, fileName)
      notification.success({
        title: t('export.singleSuccess', 'Pokémon exportado com sucesso!'),
        description: fileName,
      })
    } catch (error) {
      notification.error({
        title: t('export.error', 'Erro ao exportar Pokémon'),
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  const exportMultiple = async (pokemonList: PokemonSummary[], defaultZipName = 'pokemon_export.zip') => {
    if (pokemonList.length === 0) {
      notification.warning({
        title: t('export.noneSelected', 'Nenhum Pokémon selecionado'),
      })
      return
    }

    if (pokemonList.length === 1) {
      await exportSingle(pokemonList[0])
      return
    }

    setExporting(true)
    try {
      const zip = new JSZip()
      const usedNames = new Set<string>()

      for (const p of pokemonList) {
        const { bytes, fileName } = await engine.pokemon.export(p.at)
        let uniqueName = fileName
        let counter = 1
        const dotIndex = fileName.lastIndexOf('.')
        const base = dotIndex !== -1 ? fileName.slice(0, dotIndex) : fileName
        const ext = dotIndex !== -1 ? fileName.slice(dotIndex) : ''

        while (usedNames.has(uniqueName)) {
          uniqueName = `${base} (${counter})${ext}`
          counter++
        }
        usedNames.add(uniqueName)
        zip.file(uniqueName, bytes)
      }

      const zipBytes = await zip.generateAsync({ type: 'uint8array' })
      downloadFile(zipBytes as Uint8Array<ArrayBuffer>, defaultZipName)

      notification.success({
        title: t('export.multipleSuccess', 'Pokémon exportados com sucesso!'),
        description: `${pokemonList.length} Pokémon -> ${defaultZipName}`,
      })
    } catch (error) {
      notification.error({
        title: t('export.error', 'Erro ao exportar Pokémon'),
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setExporting(false)
    }
  }

  return { exportSingle, exportMultiple, exporting }
}
