import { act } from 'react'
import { MemoryRouter } from 'react-router'
import { App } from 'antd'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Engine, PokemonHandle, PokemonId, PokemonSummary } from '@pkhex-everywhere/engine'
import { EngineProvider } from '@pkhex-everywhere/react'
import { render } from '../testing/render'
import { PokemonTable } from './PokemonTable'

vi.mock('../hooks/useSupports', () => ({
  useSupports: () => false,
}))

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

const unknownPokemon: PokemonSummary = {
  id: 'unknown' as unknown as PokemonId,
  at: { source: 'party', slot: 1 } as PokemonHandle,
  speciesId: null,
  speciesIndex: 0,
  species: 'Unknown (#0)',
  isUnknown: true,
  editable: false,
  form: { id: 0, name: '' },
  nickname: '',
  level: 1,
  isShiny: false,
  gender: 'genderless',
  isEgg: true,
  types: [],
}

describe('PokemonTable', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }))
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    )
  })

  const engine = {
    subscribe: () => () => {},
    pokemon: { export: vi.fn() },
  } as unknown as Engine

  it('renders Pokédex number formatted as 4-digit number or dash for null', () => {
    const { container } = render(
      <MemoryRouter>
        <App>
          <EngineProvider engine={engine}>
            <PokemonTable pokemon={[pikachu, unknownPokemon]} />
          </EngineProvider>
        </App>
      </MemoryRouter>,
    )

    const tableText = container.textContent ?? ''
    expect(tableText).toContain('#0025')
    expect(tableText).toContain('—')
  })

  it('renders batch export bar when batchExport is true and items are selected', () => {
    const onSelectedChange = vi.fn()
    const { container } = render(
      <MemoryRouter>
        <App>
          <EngineProvider engine={engine}>
            <PokemonTable
              pokemon={[pikachu]}
              selected={[pikachu]}
              onSelectedChange={onSelectedChange}
              batchExport="test.zip"
            />
          </EngineProvider>
        </App>
      </MemoryRouter>,
    )

    expect(container.textContent).toMatch(/1 Pokémon (selected|selecionado)/)
    expect(container.textContent).toMatch(/Export(ar)? \(\.pk\)/)
  })

  it('shows .zip export option when multiple items are selected', () => {
    const onSelectedChange = vi.fn()
    const { container } = render(
      <MemoryRouter>
        <App>
          <EngineProvider engine={engine}>
            <PokemonTable
              pokemon={[pikachu, unknownPokemon]}
              selected={[pikachu, unknownPokemon]}
              onSelectedChange={onSelectedChange}
              batchExport="test.zip"
            />
          </EngineProvider>
        </App>
      </MemoryRouter>,
    )

    expect(container.textContent).toMatch(/2 Pokémon (selected|selecionados)/)
    expect(container.textContent).toMatch(/Export(ar)? \(2\) (as|como) \.zip/)
  })

  it('clears selection when clicking the clear button', () => {
    const onSelectedChange = vi.fn()
    const { container } = render(
      <MemoryRouter>
        <App>
          <EngineProvider engine={engine}>
            <PokemonTable
              pokemon={[pikachu]}
              selected={[pikachu]}
              onSelectedChange={onSelectedChange}
              batchExport="test.zip"
            />
          </EngineProvider>
        </App>
      </MemoryRouter>,
    )

    const clearButton = [...container.querySelectorAll('button')].find(
      (btn) => btn.textContent?.includes('Limpar seleção') || btn.textContent?.includes('Clear selection'),
    )
    expect(clearButton).toBeDefined()
    act(() => {
      clearButton?.click()
    })

    expect(onSelectedChange).toHaveBeenCalledWith([], [])
  })
})

