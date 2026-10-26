import { useState } from 'react'
import { Descriptions, Flex, Grid, Input, InputNumber, Radio } from 'antd'
import type { PokemonHandler } from '@pkhex-everywhere/engine'
import { TrainerGenderRadio } from '../../components/TrainerGenderRadio'
import { useTranslation } from '../../i18n'
import { useDraft } from './useDraft'

const columns = { xs: 1, sm: 2, md: 3 }
const maxId = 4_294_967_295

export function TrainerTab() {
  const { t } = useTranslation()
  const { details, submit } = useDraft()
  const layout = Grid.useBreakpoint().sm ? 'horizontal' : 'vertical'
  const handledBy = (handler: PokemonHandler) => details.currentHandler === handler

  return (
    <Flex vertical gap={20}>
      <Descriptions
        bordered
        size="small"
        layout={layout}
        column={columns}
        items={[
          {
            key: 'handler',
            label: t('trainer.handler'),
            children: (
              <Radio.Group
                optionType="button"
                buttonStyle="solid"
                value={details.currentHandler}
                onChange={(event) => submit({ currentHandler: event.target.value as PokemonHandler })}
                options={[
                  { value: 'originalTrainer', label: 'OT' },
                  { value: 'handlingTrainer', label: t('trainer.other') },
                ]}
              />
            ),
          },
        ]}
      />
      <Descriptions
        title={handledBy('originalTrainer') ? `${t('trainer.originalTrainer')} ✅` : t('trainer.originalTrainer')}
        bordered
        size="small"
        layout={layout}
        column={columns}
        items={[
          {
            key: 'tid',
            label: 'TID',
            children: (
              <InputNumber<number>
                aria-label="TID"
                placeholder="TID"
                value={details.trainerId}
                onChange={(trainerId) => trainerId !== null && submit({ trainerId })}
                min={0}
                max={maxId}
                precision={0}
              />
            ),
          },
          {
            key: 'sid',
            label: 'SID',
            children: (
              <InputNumber<number>
                aria-label="SID"
                placeholder="SID"
                value={details.secretId}
                onChange={(secretId) => secretId !== null && submit({ secretId })}
                min={0}
                max={maxId}
                precision={0}
              />
            ),
          },
          {
            key: 'name',
            label: t('trainer.name'),
            children: (
              <NameInput
                placeholder={t('trainer.name')}
                value={details.originalTrainerName}
                onCommit={(originalTrainerName) => submit({ originalTrainerName })}
              />
            ),
          },
          {
            key: 'gender',
            label: t('trainer.gender'),
            children: (
              <TrainerGenderRadio
                value={details.originalTrainerGender}
                onChange={(originalTrainerGender) => submit({ originalTrainerGender })}
              />
            ),
          },
        ]}
      />
      <Descriptions
        title={handledBy('handlingTrainer') ? `${t('trainer.currentHandler')} ✅` : t('trainer.currentHandler')}
        bordered
        size="small"
        layout={layout}
        column={columns}
        items={[
          {
            key: 'name',
            label: t('trainer.name'),
            children: (
              <NameInput
                placeholder={t('trainer.name')}
                value={details.handlingTrainerName}
                onCommit={(handlingTrainerName) => submit({ handlingTrainerName })}
              />
            ),
          },
          {
            key: 'gender',
            label: t('trainer.gender'),
            children: (
              <TrainerGenderRadio
                value={details.handlingTrainerGender}
                onChange={(handlingTrainerGender) => submit({ handlingTrainerGender })}
              />
            ),
          },
        ]}
      />
    </Flex>
  )
}

interface NameInputProps {
  value: string
  placeholder?: string
  onCommit: (name: string) => unknown
}

function NameInput({ value, placeholder = 'Name', onCommit }: NameInputProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const commit = () => {
    if (draft !== null && draft !== value) onCommit(draft)
    setDraft(null)
  }

  return (
    <Input
      value={draft ?? value}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onPressEnter={commit}
      placeholder={placeholder}
      style={{ maxWidth: 200 }}
    />
  )
}
