import languagesObject from '../../i18n/messages'
import ISO6391 from 'iso-639-1'
import _ from 'lodash'

const specialLanguageCodes = {
  'ja_easy': 'ja',
  'zh_Hant': 'zh-HANT',
  'zh': 'zh-Hans'
}

const internalToBrowserLocale = code => specialLanguageCodes[code] || code

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
