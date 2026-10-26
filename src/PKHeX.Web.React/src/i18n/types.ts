export type Language = 'pt-BR' | 'en' | 'es'

export interface LanguageOption {
  code: Language
  label: string
  flag: string
}

export const availableLanguages: LanguageOption[] = [
  { code: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
]
