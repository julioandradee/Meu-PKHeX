import { useCallback, useState } from 'react'
import { App } from 'antd'
import JSZip from 'jszip'
import type { PokemonSummary } from '@pkhex-everywhere/engine'
import { useEngine } from '@pkhex-everywhere/react'
import { useTranslation } from '../../i18n'

export interface FailedFile {
  name: string
  error: string
}

export function useLoadPokemonFile() {
  const engine = useEngine()
  const { notification } = App.useApp()
  const { t } = useTranslation()

  const [importedPokemon, setImportedPokemon] = useState<PokemonSummary[]>([])
  const [failedFiles, setFailedFiles] = useState<FailedFile[]>([])
  const [isImporting, setIsImporting] = useState(false)

  const clearImported = useCallback(() => {
    setImportedPokemon([])
    setFailedFiles([])
  }, [])

  const loadFiles = useCallback(
    async (files: FileList | File[]) => {
      setIsImporting(true)
      const imported: PokemonSummary[] = []
      const failed: FailedFile[] = []

      const ignoredExtensions = ['.txt', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.md', '.json', '.pdf', '.docx', '.csv', '.xml']

      const processBytes = async (name: string, bytes: Uint8Array | File) => {
        try {
          const added = await engine.box.addFromFile(bytes)
          const summary = await engine.pokemon.get(added.at)
          imported.push(summary)
        } catch (error) {
          failed.push({
            name,
            error: error instanceof Error ? error.message : String(error),
          })
        }
      }

      try {
        const fileList = Array.from(files)
        for (const file of fileList) {
          if (
            file.name.toLowerCase().endsWith('.zip') ||
            file.type === 'application/zip' ||
            file.type === 'application/x-zip-compressed'
          ) {
            try {
              const zip = await JSZip.loadAsync(file)
              for (const [relativePath, entry] of Object.entries(zip.files)) {
                if (entry.dir) continue
                const cleanName = relativePath.replace(/\\/g, '/')
                if (cleanName.startsWith('__MACOSX/') || cleanName.split('/').some((part) => part.startsWith('.'))) {
                  continue
                }
                if (ignoredExtensions.some((ext) => cleanName.toLowerCase().endsWith(ext))) {
                  continue
                }
                const bytes = await entry.async('uint8array')
                await processBytes(entry.name, bytes)
              }
            } catch (zipError) {
              failed.push({
                name: file.name,
                error: zipError instanceof Error ? zipError.message : 'Arquivo ZIP inválido ou corrompido',
              })
            }
          } else {
            await processBytes(file.name, file)
          }
        }

        setImportedPokemon(imported)
        setFailedFiles(failed)

        if (imported.length === 0 && failed.length > 0) {
          notification.error({
            title: t('import.noneImported', 'Nenhum Pokémon pôde ser importado'),
            description: failed.map((f) => `${f.name}: ${f.error}`).join('; '),
          })
        }
      } finally {
        setIsImporting(false)
      }
    },
    [engine, notification, t],
  )

  const loadPokemonFile = useCallback((file: File) => loadFiles([file]), [loadFiles])

  return {
    loadFiles,
    loadPokemonFile,
    isImporting,
    importedPokemon,
    failedFiles,
    clearImported,
  }
}
