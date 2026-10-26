import { Alert, Empty, Flex, Tabs } from 'antd'
import { useEvents } from '@pkhex-everywhere/react'
import { PageHeader } from '../../components/PageHeader'
import { useTranslation } from '../../i18n'
import { FlagsTab } from './FlagsTab'
import { TicketsTab } from './TicketsTab'
import { WorkTab } from './WorkTab'

export default function EventsPage() {
  const { events } = useEvents()
  const { t } = useTranslation()

  return (
    <Flex vertical gap={20}>
      <PageHeader title={t('events.title', 'Events')} />
      <Alert
        type="warning"
        showIcon
        title={t('events.warning', 'Changing event flags can break story progression. Keep a backup of your save.')}
      />
      {events ? (
        <Tabs
          items={[
            ...(events.gen3
              ? [{ key: 'gen3', label: t('events.tab.tickets', 'Tickets and islands'), children: <TicketsTab gen3={events.gen3} /> }]
              : []),
            { key: 'flags', label: t('events.tab.flags', 'Flags'), children: <FlagsTab events={events} /> },
            ...(events.work.length > 0
              ? [{ key: 'work', label: t('events.tab.work', 'Work'), children: <WorkTab events={events} /> }]
              : []),
          ]}
        />
      ) : (
        <Empty description={t('events.empty', 'This save has no event labels to edit.')} />
      )}
    </Flex>
  )
}
