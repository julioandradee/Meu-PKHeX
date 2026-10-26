import type { Language } from './types'

export const translations: Record<Language, Record<string, string>> = {
  'pt-BR': {
    // Menu de navegação
    'menu.home': 'Início',
    'menu.party': 'Equipe',
    'menu.box': 'Caixas Pokémon',
    'menu.items': 'Itens',
    'menu.events': 'Eventos',
    'menu.plugins': 'Plug-Ins',
    'menu.managePlugins': 'Gerenciar Plug-Ins',
    'menu.analytics': 'Estatísticas',
    'menu.save': 'Salvar / Carregar',

    // Configurações (Settings)
    'settings.title': 'Configurações',
    'settings.general': 'Geral',
    'settings.language': 'Idioma',
    'settings.languagePlaceholder': 'Selecione o idioma da interface',
    'settings.calculator': 'Calculadora',
    'settings.calculatorPlaceholder': 'Calculadora ou URL (Padrão: Showdown)',
    'settings.appearance': 'Aparência',
    'settings.theme': 'Tema',
    'settings.theme.dark': 'Escuro',
    'settings.theme.light': 'Claro',

    // Geral / Layout / Header / Footer
    'common.settings': 'Configurações',
    'common.loading': 'Carregando...',
    'common.saveNotSupported': 'Este save não suporta esta página.',
    'common.pageNotFound': 'Desculpe, não há nada neste endereço.',
    'common.credits': 'Créditos',
    'common.privacyPolicy': 'Política de Privacidade',
    'common.termsOfUse': 'Termos de Uso',
    'common.releaseNotes': 'Notas de Atualização',

    // Página de Carregamento (Load)
    'load.title': 'Carregar Save',
    'load.dropHere': 'Arraste e solte seu arquivo de save aqui',
    'load.orBrowse': 'ou selecione do seu computador',
    'load.openDemo': 'Abrir Save de Demonstração',
  },
  en: {
    // Navigation Menu
    'menu.home': 'Home',
    'menu.party': 'Party',
    'menu.box': 'Pokemon Box',
    'menu.items': 'Items',
    'menu.events': 'Events',
    'menu.plugins': 'Plug-Ins',
    'menu.managePlugins': 'Manage Plug-Ins',
    'menu.analytics': 'Analytics',
    'menu.save': 'Save',

    // Settings
    'settings.title': 'Settings',
    'settings.general': 'General',
    'settings.language': 'Language',
    'settings.languagePlaceholder': 'Select interface language',
    'settings.calculator': 'Calculator',
    'settings.calculatorPlaceholder': 'Calculator or URL (Default: Showdown)',
    'settings.appearance': 'Appearance',
    'settings.theme': 'Theme',
    'settings.theme.dark': 'Dark',
    'settings.theme.light': 'Light',

    // Common / Layout / Header / Footer
    'common.settings': 'Settings',
    'common.loading': 'Loading...',
    'common.saveNotSupported': "This save doesn't support this page.",
    'common.pageNotFound': "Sorry, there's nothing at this address.",
    'common.credits': 'Credits',
    'common.privacyPolicy': 'Privacy Policy',
    'common.termsOfUse': 'Terms of Use',
    'common.releaseNotes': 'Release Notes',

    // Load page
    'load.title': 'Load Save',
    'load.dropHere': 'Drop your save file here',
    'load.orBrowse': 'or browse from your device',
    'load.openDemo': 'Open Demo Save',
  },
  es: {
    // Menú de navegación
    'menu.home': 'Inicio',
    'menu.party': 'Equipo',
    'menu.box': 'Cajas Pokémon',
    'menu.items': 'Objetos',
    'menu.events': 'Eventos',
    'menu.plugins': 'Plug-Ins',
    'menu.managePlugins': 'Gestionar Plug-Ins',
    'menu.analytics': 'Estadísticas',
    'menu.save': 'Guardar / Cargar',

    // Configuración (Settings)
    'settings.title': 'Configuración',
    'settings.general': 'General',
    'settings.language': 'Idioma',
    'settings.languagePlaceholder': 'Seleccione el idioma de la interfaz',
    'settings.calculator': 'Calculadora',
    'settings.calculatorPlaceholder': 'Calculadora o URL (Por defecto: Showdown)',
    'settings.appearance': 'Apariencia',
    'settings.theme': 'Tema',
    'settings.theme.dark': 'Oscuro',
    'settings.theme.light': 'Claro',

    // General / Layout / Header / Footer
    'common.settings': 'Configuración',
    'common.loading': 'Cargando...',
    'common.saveNotSupported': 'Este archivo de guardado no es compatible con esta página.',
    'common.pageNotFound': 'Lo sentimos, no hay nada en esta dirección.',
    'common.credits': 'Créditos',
    'common.privacyPolicy': 'Política de Privacidad',
    'common.termsOfUse': 'Términos de Uso',
    'common.releaseNotes': 'Notas de Versión',

    // Página de Carga (Load)
    'load.title': 'Cargar Partida',
    'load.dropHere': 'Arrastra tu archivo de guardado aquí',
    'load.orBrowse': 'o selecciona desde tu dispositivo',
    'load.openDemo': 'Abrir Partida de Demostración',
  },
}
