import { Button, Card, Checkbox, Flex, Typography, App } from 'antd'
import { EngineError, type TicketsAndIslands } from '@pkhex-everywhere/engine'
import { useEvents } from '@pkhex-everywhere/react'
import { useTranslation } from '../../i18n'
import { useEventEdit } from './useEventEdit'

export function TicketsTab({ gen3 }: { gen3: TicketsAndIslands }) {
  const { t } = useTranslation()
  const { giveTickets, setFlag } = useEvents()
  const { message, modal } = App.useApp()
  const edit = useEventEdit()

  const give = async () => {
    const includeOldSeaMap =
      !gen3.oldSeaMapNeedsConfirmation ||
      (await modal.confirm({
        title: t('events.tickets.oldSeaMapTitle', 'Add the Old Sea Map?'),
        content: t('events.tickets.oldSeaMapContent', 'The Old Sea Map was only distributed in Japan. Add it to this save anyway?'),
        okText: t('actions.add', 'Add'),
        cancelText: 'Skip',
      }))

    try {
      const added = await giveTickets(includeOldSeaMap)
      if (added.length === 0) message.info(t('events.tickets.noneAdded', 'No tickets were added.'))
      else message.success(`${t('events.tickets.addedSuccess', 'Added')} ${added.join(', ')}.`)
    } catch (error) {
      if (!(error instanceof EngineError) || error.code !== 'pouch-full') throw error
      message.error(error.message)
    }
  }

  return (
    <Flex vertical gap={16}>
      <Card size="small" title={t('events.tickets.title', 'Tickets')}>
        <Flex vertical gap={12}>
          <Typography.Paragraph style={{ margin: 0 }}>
            {t('events.tickets.addsToKeyItems', 'Adds {0} to Key Items.').replace('{0}', gen3.tickets.join(', '))}
          </Typography.Paragraph>
          <div>
            <Button type="primary" disabled={!gen3.anyTicketMissing} onClick={give}>
              {t('events.tickets.giveTickets', 'Give tickets')}
            </Button>
          </div>
        </Flex>
      </Card>
      {gen3.islands.length > 0 && (
        <Card size="small" title={t('events.islands.title', 'Islands')}>
          <Flex vertical gap={8}>
            {gen3.islands.map((island) => (
              <Checkbox
                key={island.index}
                checked={island.value}
                onChange={(e) => edit(() => setFlag(island.index, e.target.checked))}
              >
                {island.name}
              </Checkbox>
            ))}
          </Flex>
        </Card>
      )}
    </Flex>
  )
}
