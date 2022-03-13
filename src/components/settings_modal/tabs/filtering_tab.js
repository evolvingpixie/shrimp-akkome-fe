import { filter, trim } from 'lodash'
import BooleanSetting from '../helpers/boolean_setting.vue'
import ChoiceSetting from '../helpers/choice_setting.vue'
import IntegerSetting from '../helpers/integer_setting.vue'

import SharedComputedObject from '../helpers/shared_computed_object.js'

const FilteringTab = {
  data () {
    return {
      muteWordsStringLocal: this.$store.getters.mergedConfig.muteWords.join('\n'),
      replyVisibilityOptions: ['all', 'following', 'self'].map(mode => ({
        key: mode,
        value: mode,
        label: this.$t(`settings.reply_visibility_${mode}`)
      }))
    }
  },
  components: {
    BooleanSetting,
    ChoiceSetting,
    IntegerSetting
  },
  computed: {
    ...SharedComputedObject(),
    muteWordsString: {
      get () {
        return this.muteWordsStringLocal
      },
      set (value) {
        this.muteWordsStringLocal = value
        this.$store.dispatch('setOption', {
          name: 'muteWords',
          value: filter(value.split('\n'), (word) => trim(word).length > 0)
        })
      }
    }
  },
  // Updating nested properties
  watch: {
    notificationVisibility: {
      handler (value) {
        this.$store.dispatch('setOption', {
          name: 'notificationVisibility',
          value: this.$store.getters.mergedConfig.notificationVisibility
        })
      },
      deep: true
    },
    replyVisibility () {
      this.$store.dispatch('queueFlushAll')
    }
  }
}

export default FilteringTab
