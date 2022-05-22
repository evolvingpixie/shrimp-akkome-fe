<template>
  <div>
    <label for="interface-language-switcher">
      {{ promptText }}
    </label>
    {{ ' ' }}
    <Select
      id="interface-language-switcher"
      v-model="controlledLanguage"
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
import localeService from '../../services/locale/locale.service.js'
import Select from '../select/select.vue'

export default {
  components: {
    Select
  },
  props: {
    promptText: {
      type: String,
      required: true
    },
    language: {
      type: String,
      required: true
    },
    setLanguage: {
      type: Function,
      required: true
    }
  },
  computed: {
    languages () {
      return localeService.languages
    },

    controlledLanguage: {
      get: function () { return this.language },
      set: function (val) {
        this.setLanguage(val)
      }
    }
  },

  methods: {
    getLanguageName (code) {
      return localeService.getLanguageName(code)
    }
  }
}
</script>
