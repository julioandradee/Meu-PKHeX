import { act } from 'react'
import { App } from 'antd'
import JSZip from 'jszip'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Engine, PokemonHandle, PokemonId, PokemonSummary } from '@pkhex-everywhere/engine'
import { EngineProvider } from '@pkhex-everywhere/react'
import * as host from '../host'
import { render } from '../testing/render'
import { useExportPokemon } from './useExportPokemon'

const pikachu: PokemonSummary = {
  id: 'pika' as unknown as PokemonId,
  at: { source: 'party', slot: 0 } as PokemonHandle,
  speciesId: 25,
  speciesIndex: 25,
  species: 'Pikachu',
  isUnknown: false,
  editable: true,
  form: { id: 0, name: '' },
  nickname: 'Pikachu',
  level: 50,
  isShiny: false,
  gender: 'male',
  isEgg: false,
  types: [12],
}

const bulbasaur: PokemonSummary = {
  id: 'bulba' as unknown as PokemonId,
  at: { source: 'party', slot: 1 } as PokemonHandle,
  speciesId: 1,
  speciesIndex: 1,
  species: 'Bulbasaur',
  isUnknown: false,
  editable: true,
  form: { id: 0, name: '' },
  nickname: 'Bulbasaur',
  level: 5,
  isShiny: false,
  gender: 'male',
  isEgg: false,
  types: [4, 7],
}

describe('useExportPokemon', () => {
  let downloadFileSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    downloadFileSpy = vi.spyOn(host, 'downloadFile').mockImplementation(() => {})
  })

  function renderHook() {
    let hookResult!: ReturnType<typeof useExportPokemon>
    const mockExport = vi.fn(async (at: PokemonHandle) => {
      if (at.slot === 0) {
        return {
          bytes: new Uint8Array([1, 2, 3]),
          fileName: '0025 - Pikachu.pk9',
          generation: 9,
        }
      }
      return {
        bytes: new Uint8Array([4, 5, 6]),
        fileName: '0001 - Bulbasaur.pk9',
        generation: 9,
      }
    })

    const engine = {
      subscribe: () => () => {},
      pokemon: {
        export: mockExport,
      },
    } as unknown as Engine

    function TestComponent() {
      hookResult = useExportPokemon()
      return null
    }

    render(
      <App>
        <EngineProvider engine={engine}>
          <TestComponent />
        </EngineProvider>
      </App>,
    )

    return { getHook: () => hookResult, mockExport }
  }

  it('exports a single Pokémon directly without compression', async () => {
    const { getHook, mockExport } = renderHook()
    await act(async () => {
      await getHook().exportSingle(pikachu)
    })

    expect(mockExport).toHaveBeenCalledWith(pikachu.at)
    expect(downloadFileSpy).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]), '0025 - Pikachu.pk9')
  })

  it('exports 1 selected Pokémon directly without zip compression', async () => {
    const { getHook, mockExport } = renderHook()
    await act(async () => {
      await getHook().exportMultiple([pikachu], 'box_pokemon.zip')
    })

    expect(mockExport).toHaveBeenCalledWith(pikachu.at)
    expect(downloadFileSpy).toHaveBeenCalledWith(new Uint8Array([1, 2, 3]), '0025 - Pikachu.pk9')
  })

  it('bundles multiple Pokémon in a .zip archive', async () => {
    const { getHook, mockExport } = renderHook()
    await act(async () => {
      await getHook().exportMultiple([pikachu, bulbasaur], 'custom_export.zip')
    })

    expect(mockExport).toHaveBeenCalledWith(pikachu.at)
    expect(mockExport).toHaveBeenCalledWith(bulbasaur.at)
    expect(downloadFileSpy).toHaveBeenCalled()

    const [zipBytes, zipFileName] = downloadFileSpy.mock.calls[0]
    expect(zipFileName).toBe('custom_export.zip')

    // Verify zip contents using JSZip
    const loadedZip = await JSZip.loadAsync(zipBytes)
    const pikaFile = await loadedZip.file('0025 - Pikachu.pk9')?.async('uint8array')
    const bulbaFile = await loadedZip.file('0001 - Bulbasaur.pk9')?.async('uint8array')

    expect(pikaFile).toEqual(new Uint8Array([1, 2, 3]))
    expect(bulbaFile).toEqual(new Uint8Array([4, 5, 6]))
  })

  it('handles name collisions inside the zip archive', async () => {
    const downloadFileMock = vi.spyOn(host, 'downloadFile').mockImplementation(() => {})
    let hookResult!: ReturnType<typeof useExportPokemon>

    // Both Pokémon return the exact same fileName
    const mockExport = vi.fn(async () => ({
      bytes: new Uint8Array([9, 9]),
      fileName: 'Pikachu.pk9',
      generation: 9,
    }))

    const engine = {
      subscribe: () => () => {},
      pokemon: { export: mockExport },
    } as unknown as Engine

    function TestComponent() {
      hookResult = useExportPokemon()
      return null
    }

    render(
      <App>
        <EngineProvider engine={engine}>
          <TestComponent />
        </EngineProvider>
      </App>,
    )

    await act(async () => {
      await hookResult.exportMultiple([pikachu, { ...pikachu, at: { source: 'party', slot: 1 } }])
    })

    const [zipBytes] = downloadFileMock.mock.calls[0]
    const loadedZip = await JSZip.loadAsync(zipBytes)

    expect(loadedZip.file('Pikachu.pk9')).not.toBeNull()
    expect(loadedZip.file('Pikachu (1).pk9')).not.toBeNull()
  })
})
