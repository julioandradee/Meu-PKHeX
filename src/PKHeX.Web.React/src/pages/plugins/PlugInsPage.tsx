import { useEffect, useState, type ReactNode } from 'react'
import { Alert, App, Button, Flex, Space, Table, Tag, Tooltip, Typography, type TableColumnsType } from 'antd'
import { Link } from 'react-router'
import type { InstalledPlugIn } from '@pkhex-everywhere/engine'
import { PageHeader } from '../../components/PageHeader'
import { containsText } from '../../components/filters/containsText'
import { TextFilter } from '../../components/filters/TextFilter'
import { useNavigate } from '../../host'
import { useTranslation } from '../../i18n'
import type { AvailablePlugIn } from '../../plugins/plugIns'
import { useInstalledPlugIns, usePlugIns } from '../../plugins/PlugInsContext'
import { routes } from '../../routes'

function nameColumn<T extends { name: string }>(
  t: (key: string, fallback?: string) => string,
  render: (plugIn: T) => ReactNode,
): TableColumnsType<T>[number] {
  return {
    title: t('table.name', 'Name'),
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    filterDropdown: (props) => <TextFilter {...props} placeholder={t('table.name', 'Name')} />,
    onFilter: (value, plugIn) => containsText(plugIn.name, value),
    render: (_: unknown, plugIn: T) => render(plugIn),
  }
}

export default function PlugInsPage() {
  const { t } = useTranslation()
  const plugIns = usePlugIns()
  const installed = useInstalledPlugIns()
  const navigate = useNavigate()
  const { notification } = App.useApp()
  const [available, setAvailable] = useState<AvailablePlugIn[] | 'failed'>([])
  const [busy, setBusy] = useState<string>()

  useEffect(() => {
    let active = true
    plugIns.available().then(
      (loaded) => active && setAvailable(loaded),
      (error) => {
        console.error("Couldn't list the plug-ins of the sources.", error)
        if (active) setAvailable('failed')
      },
    )
    return () => {
      active = false
    }
  }, [plugIns, installed])

  async function whileBusy<T>(id: string, failure: string, call: () => Promise<T>): Promise<T | undefined> {
    setBusy(id)
    try {
      return await call()
    } catch (error) {
      console.error(error)
      notification.error({ title: failure, description: 'Try again later.' })
      return undefined
    } finally {
      setBusy(undefined)
    }
  }

  const reachingTheSource = <T,>(id: string, call: () => Promise<T>) =>
    whileBusy(id, t('plugins.reachSourceError', "Couldn't reach the plug-in source"), call)

  async function install(plugIn: AvailablePlugIn) {
    const id = await reachingTheSource(plugIn.id, () => plugIns.install(plugIn.sourceUrl, plugIn.id))
    if (!id) return
    notification.success({ title: t('plugins.installedSuccess', 'Plug-in installed') })
    await navigate(routes.plugIn(id))
  }

  async function update(id: string) {
    if (await reachingTheSource(id, () => plugIns.update(id))) {
      notification.success({ title: t('plugins.updatedSuccess', 'Plug-in updated') })
    }
  }

  const uninstall = (id: string) =>
    whileBusy(id, t('plugins.uninstallError', "Couldn't uninstall the plug-in"), () => plugIns.uninstall(id))

  const installedColumns: TableColumnsType<InstalledPlugIn> = [
    nameColumn(t, (plugIn) => (plugIn.needsReinstall ? plugIn.id : <Link to={routes.plugIn(plugIn.id)}>{plugIn.name}</Link>)),
    {
      title: 'Version',
      key: 'version',
      render: (_: unknown, plugIn: InstalledPlugIn) =>
        plugIn.needsReinstall ? (
          <Tooltip title={t('plugins.needsReinstallTooltip', "This plug-in can't run in this version of the app. Uninstall it and install it again.")}>
            <Tag color="warning">{t('plugins.needsReinstall', 'Needs reinstall')}</Tag>
          </Tooltip>
        ) : (
          <Space>
            {plugIn.version}
            {plugIn.hasNewerVersion && <Tag color="processing">{t('plugins.updateAvailable', 'Update available')}</Tag>}
          </Space>
        ),
    },
    {
      title: t('plugins.actions', 'Actions'),
      key: 'actions',
      render: (_: unknown, plugIn: InstalledPlugIn) => (
        <Space>
          {plugIn.hasNewerVersion && !plugIn.needsReinstall && (
            <Button type="link" disabled={!!busy} loading={busy === plugIn.id} onClick={() => void update(plugIn.id)}>
              {t('plugins.update', 'Update')}
            </Button>
          )}
          <Button type="link" danger disabled={!!busy} onClick={() => void uninstall(plugIn.id)}>
            {t('plugins.uninstall', 'Uninstall')}
          </Button>
        </Space>
      ),
    },
  ]

  const availableColumns: TableColumnsType<AvailablePlugIn> = [
    nameColumn(t, (plugIn) =>
      plugIn.projectUrl ? (
        <a href={plugIn.projectUrl} target="_blank" rel="noopener noreferrer">
          {plugIn.name}
        </a>
      ) : (
        plugIn.name
      ),
    ),
    { title: t('plugins.description', 'Description'), dataIndex: 'description' },
    { title: 'Version', dataIndex: 'version' },
    { title: t('plugins.source', 'Source'), dataIndex: 'sourceName', sorter: (a, b) => a.sourceName.localeCompare(b.sourceName) },
    {
      title: t('plugins.actions', 'Actions'),
      key: 'actions',
      render: (_: unknown, plugIn: AvailablePlugIn) => (
        <Button type="link" disabled={!!busy} loading={busy === plugIn.id} onClick={() => void install(plugIn)}>
          {t('plugins.install', 'Install')}
        </Button>
      ),
    },
  ]

  return (
    <Flex vertical gap={20}>
      <PageHeader title={t('plugins.title', 'Manage Plug-Ins')} />
      {installed.length > 0 && (
        <>
          <Typography.Title level={5}>{t('plugins.installed', 'Installed')}</Typography.Title>
          <Table
            rowKey="id"
            dataSource={installed}
            columns={installedColumns}
            size="small"
            scroll={{ x: 'max-content' }}
            pagination={{ hideOnSinglePage: true }}
          />
        </>
      )}
      {available === 'failed' ? (
        <Alert type="warning" title={t('plugins.reachSourceError', "Couldn't reach the plug-in sources. Try again later.")} showIcon />
      ) : (
        available.length > 0 && (
          <>
            <Typography.Title level={5}>{t('plugins.discover', 'Discover')}</Typography.Title>
            <Table
              rowKey={(plugIn) => `${plugIn.sourceUrl}#${plugIn.id}`}
              dataSource={available}
              columns={availableColumns}
              size="small"
              scroll={{ x: 'max-content' }}
              pagination={{ hideOnSinglePage: true }}
            />
          </>
        )
      )}
    </Flex>
  )
}
