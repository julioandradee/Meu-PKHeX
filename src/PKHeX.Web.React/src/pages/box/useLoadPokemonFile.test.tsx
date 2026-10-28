import { act } from 'react'
import { App } from 'antd'
import JSZip from 'jszip'
import { describe, expect, it, vi } from 'vitest'
import type { Engine, PokemonHandle, PokemonId, PokemonSummary } from '@pkhex-everywhere/engine'
import { EngineProvider } from '@pkhex-everywhere/react'
import { render } from '../../testing/render'
import { useLoadPokemonFile } from './useLoadPokemonFile'

const pikachu: PokemonSummary = {
  id: 'pika' as unknown as PokemonId,
  at: { source: 'box', box: 0, slot: 0 } as PokemonHandle,
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

const charmander: PokemonSummary = {
  id: 'char' as unknown as PokemonId,
  at: { source: 'box', box: 0, slot: 1 } as PokemonHandle,
  speciesId: 4,
  speciesIndex: 4,
  species: 'Charmander',
  isUnknown: false,
  editable: true,
  form: { id: 0, name: '' },
  nickname: 'Charmander',
  level: 15,
  isShiny: false,
  gender: 'male',
  isEgg: false,
  types: [10],
}

describe('useLoadPokemonFile', () => {
  function renderHook() {
    let hookResult!: ReturnType<typeof useLoadPokemonFile>

    const mockAddFromFile = vi.fn(async (bytes: unknown) => {
      // If bytes is pikachu or charmander
      return { id: 'added' as unknown as PokemonId, at: { source: 'box', box: 0, slot: 0 } as PokemonHandle }
    })

    const mockGet = vi.fn(async (_at: PokemonHandle) => pikachu)

    const engine = {
      subscribe: () => () => {},
      box: { addFromFile: mockAddFromFile },
      pokemon: { get: mockGet },
    } as unknown as Engine

    function TestComponent() {
      hookResult = useLoadPokemonFile()
      return null
    }

    render(
      <App>
        <EngineProvider engine={engine}>
          <TestComponent />
        </EngineProvider>
      </App>,
    )

    return { getHook: () => hookResult, mockAddFromFile, mockGet }
  }

  it('imports a single .pk file and populates importedPokemon', async () => {
    const { getHook, mockAddFromFile } = renderHook()
    const file = new File([new Uint8Array([1, 2, 3])], 'pikachu.pk9')

    await act(async () => {
      await getHook().loadFiles([file])
    })

    expect(mockAddFromFile).toHaveBeenCalledTimes(1)
    expect(getHook().importedPokemon).toEqual([pikachu])
    expect(getHook().failedFiles).toEqual([])
  })

  it('imports a .zip file with multiple pokemon files using JSZip', async () => {
    const { getHook, mockAddFromFile, mockGet } = renderHook()

    mockGet.mockImplementation(async (at: PokemonHandle) => {
      return at.slot === 1 ? charmander : pikachu
    })

    let slotCounter = 0
    mockAddFromFile.mockImplementation(async () => {
      const slot = slotCounter++
      return { id: `id-${slot}` as unknown as PokemonId, at: { source: 'box', box: 0, slot } as PokemonHandle }
    })

    // Create a zip with 2 Pokémon files and 1 ignored file
    const zip = new JSZip()
    zip.file('pikachu.pk9', new Uint8Array([1, 2, 3]))
    zip.file('charmander.pk9', new Uint8Array([4, 5, 6]))
    zip.file('readme.txt', 'This is a text file')
    zip.file('__MACOSX/._pikachu.pk9', new Uint8Array([0]))

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const zipFile = new File([zipBlob], 'pokemons.zip', { type: 'application/zip' })

    await act(async () => {
      await getHook().loadFiles([zipFile])
    })

    // Only the 2 pokemon files should be added, skipping readme.txt and __MACOSX
    expect(mockAddFromFile).toHaveBeenCalledTimes(2)
    expect(getHook().importedPokemon.length).toBe(2)
  })

  it('clears imported list when clearImported is called', async () => {
    const { getHook } = renderHook()
    const file = new File([new Uint8Array([1, 2, 3])], 'pikachu.pk9')

    await act(async () => {
      await getHook().loadFiles([file])
    })
    expect(getHook().importedPokemon.length).toBe(1)

    act(() => {
      getHook().clearImported()
    })
    expect(getHook().importedPokemon).toEqual([])
    expect(getHook().failedFiles).toEqual([])
  })
})
