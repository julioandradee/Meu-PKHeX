import { useState } from 'react'
import { Button, Descriptions, Grid, InputNumber, Radio, Space, Switch, Typography } from 'antd'
import type { DescriptionsProps } from 'antd'
import { draftHandle, type PokemonGender } from '@pkhex-everywhere/engine'
import { useQuery } from '@pkhex-everywhere/react'
import { ItemSelect } from '../../components/ItemSelect'
import { useTranslation } from '../../i18n'
import { ChoiceSelect } from './ChoiceSelect'
import { ExperienceModal } from './ExperienceModal'
import { isLocked } from './locked'
import { useDraft } from './useDraft'

const typesUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield'

const genders: { value: PokemonGender; label: string }[] = [
  { value: 'male', label: '♂' },
  { value: 'female', label: '♀' },
  { value: 'genderless', label: '⚲' },
]

export function DescriptionTab() {
  const { details, submit } = useDraft()
  const options = useQuery('pokemon.options', draftHandle)
  const natures = useQuery('game.natures')
  const balls = useQuery('game.balls')
  const languages = useQuery('game.languages')
  const screens = Grid.useBreakpoint()
  const [editingExperience, setEditingExperience] = useState(false)
  const { t } = useTranslation()

  const items: DescriptionsProps['items'] = [
    {
      key: 'species',
      label: t('editor.fields.species', 'Species'),
      children: (
        <ChoiceSelect label={t('editor.fields.species', 'Species')} choices={options.species} value={details.species} onChange={(species) => submit({ species })} />
      ),
    },
    {
      key: 'types',
      label: t('editor.fields.types', 'Types'),
      children: (
        <Space size={5} wrap>
          {details.types.map((type) => (
            <img key={type} alt={`Type ${type}`} src={`${typesUrl}/${type + 1}.png`} style={{ width: 75 }} />
          ))}
        </Space>
      ),
    },
    {
      key: 'pid',
      label: 'PID',
      children: <Typography.Text copyable>{details.pid.toString(16).toUpperCase().padStart(8, '0')}</Typography.Text>,
    },
    {
      key: 'nickname',
      label: t('editor.fields.nickname', 'Nickname'),
      children: (
        <Typography.Text editable={{ text: details.nickname, onChange: (nickname) => submit({ nickname }) }}>
          {details.nickname}
        </Typography.Text>
      ),
    },
    {
      key: 'gender',
      label: t('editor.fields.gender', 'Gender'),
      children: (
        <Radio.Group
          aria-label={t('editor.fields.gender', 'Gender')}
          optionType="button"
          buttonStyle="solid"
          value={details.gender}
          disabled={isLocked(options, 'gender')}
          options={genders.filter((gender) => gender.value !== 'genderless' || details.gender === 'genderless')}
          onChange={(event) => submit({ gender: event.target.value as PokemonGender })}
        />
      ),
    },
    {
      key: 'shiny',
      label: t('editor.fields.shiny', 'Shiny'),
      children: <Switch aria-label={t('editor.fields.shiny', 'Shiny')} checked={details.isShiny} onChange={(isShiny) => submit({ isShiny })} />,
    },
    ...(details.isAlpha === null
      ? []
      : [
          {
            key: 'alpha',
            label: t('editor.fields.alpha', 'Alpha'),
            children: <Switch aria-label={t('editor.fields.alpha', 'Alpha')} checked={details.isAlpha} onChange={(isAlpha: boolean) => submit({ isAlpha })} />,
          },
        ]),
    {
      key: 'level',
      label: t('editor.fields.level', 'Level'),
      children: (
        <Space>
          <InputNumber
            aria-label={t('editor.fields.level', 'Level')}
            min={1}
            max={100}
            value={details.level}
            onChange={(level) => level !== null && submit({ level })}
          />
          <Button type="link" size="small" onClick={() => setEditingExperience(true)}>
            {t('editor.fields.editExp', 'Edit EXP')}
          </Button>
        </Space>
      ),
    },
    ...(natures.length === 0
      ? []
      : [
          {
            key: 'nature',
            label: t('editor.fields.nature', 'Nature'),
            children: (
              <ChoiceSelect
                label={t('editor.fields.nature', 'Nature')}
                choices={natures}
                value={details.nature}
                disabled={isLocked(options, 'nature')}
                onChange={(nature) => submit({ nature })}
              />
            ),
          },
        ]),
    ...(options.forms.length === 0
      ? []
      : [
          {
            key: 'form',
            label: t('editor.fields.form', 'Form'),
            children: <ChoiceSelect label={t('editor.fields.form', 'Form')} choices={options.forms} value={details.form} onChange={(form) => submit({ form })} />,
          },
        ]),
    ...(options.heldItems.length <= 1
      ? []
      : [
          {
            key: 'heldItem',
            label: t('editor.fields.heldItem', 'Held Item'),
            children: (
              <ItemSelect
                items={options.heldItems}
                label={t('editor.fields.heldItem', 'Held Item')}
                value={details.heldItem}
                onChange={(item) => submit({ heldItem: item.id })}
              />
            ),
          },
        ]),
    ...(options.abilities.length === 0
      ? []
      : [
          {
            key: 'ability',
            label: t('editor.fields.ability', 'Ability'),
            children: (
              <ChoiceSelect
                label={t('editor.fields.ability', 'Ability')}
                choices={options.abilities}
                value={details.ability}
                disabled={isLocked(options, 'ability')}
                onChange={(ability) => submit({ ability })}
              />
            ),
          },
        ]),
    ...(balls.length === 0
      ? []
      : [
          {
            key: 'ball',
            label: t('editor.fields.ball', 'Ball'),
            children: <ItemSelect items={balls} label={t('editor.fields.ball', 'Ball')} value={details.ball} onChange={(ball) => submit({ ball: ball.id })} />,
          },
        ]),
    {
      key: 'friendship',
      label: details.isEgg ? t('editor.fields.hatchCounter', 'Hatch Counter') : t('editor.fields.friendship', 'Friendship'),
      children: (
        <InputNumber
          aria-label={details.isEgg ? t('editor.fields.hatchCounter', 'Hatch Counter') : t('editor.fields.friendship', 'Friendship')}
          min={0}
          max={255}
          value={details.friendship}
          onChange={(friendship) => friendship !== null && submit({ friendship })}
        />
      ),
    },
    ...(languages.length === 0
      ? []
      : [
          {
            key: 'language',
            label: t('editor.fields.language', 'Language'),
            children: (
              <ChoiceSelect
                label={t('editor.fields.language', 'Language')}
                choices={languages}
                value={details.language}
                onChange={(language) => submit({ language })}
              />
            ),
          },
        ]),
    {
      key: 'egg',
      label: t('editor.fields.egg', 'Egg'),
      children: <Switch aria-label={t('editor.fields.egg', 'Egg')} checked={details.isEgg} onChange={(isEgg) => submit({ isEgg })} />,
    },
    {
      key: 'infected',
      label: t('editor.fields.infected', 'Infected'),
      children: <Switch aria-label={t('editor.fields.infected', 'Infected')} disabled checked={details.isInfected} />,
    },
    {
      key: 'cured',
      label: t('editor.fields.cured', 'Cured'),
      children: <Switch aria-label={t('editor.fields.cured', 'Cured')} disabled checked={details.isCured} />,
    },
  ]

  return (
    <>
      <Descriptions
        bordered
        size="small"
        layout={screens.sm ? 'horizontal' : 'vertical'}
        column={{ xs: 1, sm: 2, md: 3 }}
        items={items}
      />
      {editingExperience && <ExperienceModal onClose={() => setEditingExperience(false)} />}
    </>
  )
}
