import { useState } from 'react'
import { AutoComplete, Descriptions, Flex, Select, Switch } from 'antd'
import { calculators } from '../../calculators'
import { changeCalculatorUrl, changeTheme, useCalculatorUrl, useTheme } from '../../host'
import { useTranslation, type Language } from '../../i18n'

function CalculatorInput({ placeholder }: { placeholder: string }) {
  const calculatorUrl = useCalculatorUrl()
  const [text, setText] = useState(() => calculators.find((c) => c.url === calculatorUrl)?.name ?? calculatorUrl)

  const handleChange = (value: string | undefined) => {
    const next = value ?? ''
    setText(next)
    const preset = calculators.find((c) => c.name === next)
    changeCalculatorUrl(preset?.url ?? next)
  }

  return (
    <AutoComplete
      aria-label="Calculator"
      style={{ width: '100%' }}
      value={text}
      onChange={handleChange}
      options={calculators.map((c) => ({ value: c.name, label: c.name }))}
      filterOption={false}
      placeholder={placeholder}
      allowClear
    />
  )
}

function LanguageSelect() {
  const { language, changeLanguage, availableLanguages, t } = useTranslation()

  return (
    <Select<Language>
      aria-label={t('settings.language')}
      style={{ width: '100%' }}
      value={language}
      onChange={(next) => changeLanguage(next)}
      options={availableLanguages.map((l) => ({
        value: l.code,
        label: `${l.flag} ${l.label}`,
      }))}
    />
  )
}

export default function SettingsPage() {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <Flex vertical gap={20}>
      <Descriptions
        title={t('settings.general')}
        bordered
        size="small"
        column={1}
        items={[
          { key: 'language', label: t('settings.language'), children: <LanguageSelect /> },
          { key: 'calculator', label: t('settings.calculator'), children: <CalculatorInput placeholder={t('settings.calculatorPlaceholder')} /> },
        ]}
      />
      <Descriptions
        title={t('settings.appearance')}
        bordered
        size="small"
        column={1}
        items={[
          {
            key: 'theme',
            label: t('settings.theme'),
            children: (
              <Switch
                checked={theme === 'dark'}
                onChange={(dark) => changeTheme(dark ? 'dark' : 'light')}
                checkedChildren={t('settings.theme.dark')}
                unCheckedChildren={t('settings.theme.light')}
              />
            ),
          },
        ]}
      />
    </Flex>
  )
}

