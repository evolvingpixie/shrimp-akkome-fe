import languagesObject from '../../i18n/messages'
import ISO6391 from 'iso-639-1'
import _ from 'lodash'

const specialLanguageCodes = {
  'ja_easy': 'ja',
  'zh_Hant': 'zh-HANT',
  'zh': 'zh-Hans'
}

// Find a browser language that matches the configured UI language.
// Browser language should match the configured generic short code prefix:
// eg 'en-GB' browser language matches 'en' UI language.
const findBrowserRegionMatch = genericLang => {
  for (const blang of window.navigator.languages) {
    if (genericLang === blang.split('-')[0])
      return blang;
  }
  return null;
}

const internalToBrowserLocale = (() => {
  const resolvedBrowserLocales = {}

  return i18nLocale => {
    if (resolvedBrowserLocales[i18nLocale]) {
      return resolvedBrowserLocales[i18nLocale]
    }
    const lang = specialLanguageCodes[i18nLocale] || i18nLocale;
    const resolved = findBrowserRegionMatch(lang) || lang;
    resolvedBrowserLocales[i18nLocale] = resolved
    return resolved
  }
})()

const internalToBackendLocale = code => internalToBrowserLocale(code).replace('_', '-')

const getLanguageName = (code) => {
  const specialLanguageNames = {
    'ja_easy': 'やさしいにほんご',
    'zh': '简体中文',
    'zh_Hant': '繁體中文'
  }
  const languageName = specialLanguageNames[code] || ISO6391.getNativeName(code)
  const browserLocale = internalToBrowserLocale(code)
  return languageName.charAt(0).toLocaleUpperCase(browserLocale) + languageName.slice(1)
}

const languages = _.map(languagesObject.languages, (code) => ({ code: code, name: getLanguageName(code) })).sort((a, b) => a.name.localeCompare(b.name))

const localeService = {
  internalToBrowserLocale,
  internalToBackendLocale,
  languages,
  getLanguageName
}

export default localeService
