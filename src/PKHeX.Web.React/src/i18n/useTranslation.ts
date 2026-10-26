import { useCallback } from 'react'
import { changeLanguage, useLanguage } from '../host'
import { translations } from './translations'
import { availableLanguages } from './types'

export function useTranslation() {
  const language = useLanguage()

  const t = useCallback(
    (key: string, fallback?: string): string => {
      return translations[language]?.[key] ?? translations['en']?.[key] ?? fallback ?? key
    },
    [language],
  )

  return {
    language,
    changeLanguage,
    t,
    availableLanguages,
  }
}
