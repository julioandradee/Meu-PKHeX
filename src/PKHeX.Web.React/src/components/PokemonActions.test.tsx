import { act } from 'react'
import { MemoryRouter } from 'react-router'
import { App } from 'antd'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Engine, PokemonHandle, PokemonId, PokemonSummary } from '@pkhex-everywhere/engine'
import { EngineProvider } from '@pkhex-everywhere/react'
import * as host from '../host'
import { render } from '../testing/render'
import { PokemonActions } from './PokemonActions'

vi.mock('../hooks/useSupports', () => ({
  useSupports: () => true,
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

describe('PokemonActions', () => {
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

  it('exports Pokémon from the action menu', async () => {
    const downloadSpy = vi.spyOn(host, 'downloadFile').mockImplementation(() => {})
    const mockExport = vi.fn(async () => ({
      bytes: new Uint8Array([7, 8, 9]),
      fileName: 'Pikachu.pk9',
      generation: 9,
    }))

    const engine = {
      subscribe: () => () => {},
      pokemon: {
        export: mockExport,
        showdown: vi.fn(),
      },
    } as unknown as Engine

    const { container } = render(
      <MemoryRouter>
        <App>
          <EngineProvider engine={engine}>
            <PokemonActions pokemon={pikachu} />
          </EngineProvider>
        </App>
      </MemoryRouter>,
    )

    // Find and click the dropdown button trigger
    const dropdownTrigger = container.querySelector('.ant-dropdown-trigger') as HTMLElement
    expect(dropdownTrigger).not.toBeNull()

    act(() => {
      dropdownTrigger.click()
    })

    // Find the Export item in the open menu
    const exportItem = [...document.querySelectorAll('.ant-dropdown-menu-item')].find(
      (el) => el.textContent?.includes('Exportar *.pk') || el.textContent?.includes('Export *.pk'),
    ) as HTMLElement

    expect(exportItem).toBeDefined()

    await act(async () => {
      exportItem.click()
    })

    expect(mockExport).toHaveBeenCalledWith(pikachu.at)
    expect(downloadSpy).toHaveBeenCalledWith(new Uint8Array([7, 8, 9]), 'Pikachu.pk9')
  })
})
