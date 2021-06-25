<template>
  <div>
    <label for="interface-language-switcher">
      {{ $t('settings.interfaceLanguage') }}
    </label>
    <Select
      id="interface-language-switcher"
      v-model="language"
    >
      <option
        v-for="lang in languages"
        :key="lang.code"
        :value="lang.code"
      >
        {{ lang.name }}
      </option>
    </Select>
  </div>
</template>

<script>
import languagesObject from '../../i18n/messages'
import localeService from '../../services/locale/locale.service.js'
import ISO6391 from 'iso-639-1'
import _ from 'lodash'
import Select from '../select/select.vue'

export default {
  components: {
    Select
  },
  computed: {
    languages () {
      return _.map(languagesObject.languages, (code) => ({ code: code, name: this.getLanguageName(code) })).sort((a, b) => a.name.localeCompare(b.name))
    },

    language: {
      get: function () { return this.$store.getters.mergedConfig.interfaceLanguage },
      set: function (val) {
        this.$store.dispatch('setOption', { name: 'interfaceLanguage', value: val })
      }
    }
  },

  methods: {
    getLanguageName (code) {
      const specialLanguageNames = {
        'ja_easy': 'やさしいにほんご',
        'zh': '简体中文',
        'zh_Hant': '繁體中文'
      }
      const languageName = specialLanguageNames[code] || ISO6391.getNativeName(code)
      const browserLocale = localeService.internalToBrowserLocale(code)
      return languageName.charAt(0).toLocaleUpperCase(browserLocale) + languageName.slice(1)
    }
  }
}
</script>
