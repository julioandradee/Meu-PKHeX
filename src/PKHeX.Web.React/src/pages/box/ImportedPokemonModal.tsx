import { CheckCircleFilled } from '@ant-design/icons'
import { Alert, Button, Flex, Modal, Table, Tag, Typography, type TableColumnsType } from 'antd'
import type { PokemonSummary } from '@pkhex-everywhere/engine'
import { useNavigate } from '../../host'
import { useTranslation } from '../../i18n'
import { routes } from '../../routes'

interface ImportedPokemonModalProps {
  open: boolean
  imported: PokemonSummary[]
  failed?: { name: string; error: string }[]
  onClose: () => void
}

export function ImportedPokemonModal({ open, imported, failed = [], onClose }: ImportedPokemonModalProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const columns: TableColumnsType<PokemonSummary> = [
    {
      title: t('table.name', 'Nome'),
      key: 'name',
      render: (_: unknown, p: PokemonSummary) => (
        <Flex vertical>
          <Typography.Text strong>{p.species}</Typography.Text>
          {p.nickname && p.nickname !== p.species && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              "{p.nickname}"
            </Typography.Text>
          )}
        </Flex>
      ),
    },
    {
      title: t('import.pokedexId', 'ID Pokédex'),
      key: 'dex',
      width: 110,
      render: (_: unknown, p: PokemonSummary) => (
        <span style={{ color: '#8c8c8c', fontFamily: 'monospace', fontWeight: 600 }}>
          {p.speciesId !== null ? `#${String(p.speciesId).padStart(4, '0')}` : '—'}
        </span>
      ),
    },
    {
      title: t('table.level', 'Nível'),
      key: 'level',
      width: 90,
      render: (_: unknown, p: PokemonSummary) => <Tag color="blue">{t('box.levelPrefix', 'Lvl')} {p.level}</Tag>,
    },
    {
      title: t('import.location', 'Localização'),
      key: 'location',
      width: 140,
      render: (_: unknown, p: PokemonSummary) => (
        <Tag color="cyan">
          {t('box.boxLabel', 'Caixa')} {(p.at.box ?? 0) + 1}, #{ (p.at.slot ?? 0) + 1 }
        </Tag>
      ),
    },
    {
      title: t('table.action', 'Ação'),
      key: 'action',
      width: 80,
      render: (_: unknown, p: PokemonSummary) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            onClose()
            void navigate(routes.pokemon(p))
          }}
        >
          {t('actions.view', 'Ver')}
        </Button>
      ),
    },
  ]

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          {t('common.close', 'Fechar')}
        </Button>,
      ]}
      width={700}
      title={
        <Flex align="center" gap={8}>
          <CheckCircleFilled style={{ color: '#52c41a', fontSize: 20 }} />
          <span>{t('import.modalTitle', 'Pokémon Importados')}</span>
        </Flex>
      }
    >
      <Flex vertical gap={12} style={{ marginTop: 16 }}>
        <Alert
          type="success"
          showIcon
          title={
            imported.length === 1
              ? t('import.singleSuccess', '1 Pokémon importado com sucesso!')
              : t('import.multipleSuccess', '{0} Pokémon importados com sucesso!').replace(
                  '{0}',
                  String(imported.length),
                )
          }
          description={t(
            'import.modalDescription',
            'Os Pokémon abaixo foram adicionados às suas caixas.',
          )}
        />

        {failed.length > 0 && (
          <Alert
            type="warning"
            showIcon
            title={t('import.failedCount', '{0} arquivo(s) não puderam ser importados').replace(
              '{0}',
              String(failed.length),
            )}
            description={
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                {failed.map((f, i) => (
                  <li key={i}>
                    <strong>{f.name}</strong>: {f.error}
                  </li>
                ))}
              </ul>
            }
          />
        )}

        <Table<PokemonSummary>
          rowKey={(p) => JSON.stringify(p.at)}
          dataSource={imported}
          columns={columns}
          size="small"
          pagination={imported.length > 10 ? { pageSize: 10, showSizeChanger: false } : false}
          scroll={{ y: 350 }}
        />
      </Flex>
    </Modal>
  )
}
