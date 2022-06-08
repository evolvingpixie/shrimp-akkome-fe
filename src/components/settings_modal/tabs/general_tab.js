import BooleanSetting from '../helpers/boolean_setting.vue'
import ChoiceSetting from '../helpers/choice_setting.vue'
import ScopeSelector from 'src/components/scope_selector/scope_selector.vue'
import IntegerSetting from '../helpers/integer_setting.vue'
import InterfaceLanguageSwitcher from 'src/components/interface_language_switcher/interface_language_switcher.vue'

import SharedComputedObject from '../helpers/shared_computed_object.js'
import ServerSideIndicator from '../helpers/server_side_indicator.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faGlobe
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faGlobe
)

const GeneralTab = {
  data () {
    return {
      subjectLineOptions: ['email', 'noop', 'masto'].map(mode => ({
        key: mode,
        value: mode,
        label: this.$t(`settings.subject_line_${mode === 'masto' ? 'mastodon' : mode}`)
      })),
      conversationDisplayOptions: ['tree', 'linear'].map(mode => ({
        key: mode,
        value: mode,
        label: this.$t(`settings.conversation_display_${mode}`)
      })),
      conversationOtherRepliesButtonOptions: ['below', 'inside'].map(mode => ({
        key: mode,
        value: mode,
        label: this.$t(`settings.conversation_other_replies_button_${mode}`)
      })),
      mentionLinkDisplayOptions: ['short', 'full_for_remote', 'full'].map(mode => ({
        key: mode,
        value: mode,
        label: this.$t(`settings.mention_link_display_${mode}`)
      })),
      thirdColumnModeOptions: ['none', 'notifications', 'postform'].map(mode => ({
        key: mode,
        value: mode,
        label: this.$t(`settings.third_column_mode_${mode}`)
      })),
      loopSilentAvailable:
      // Firefox
      Object.getOwnPropertyDescriptor(HTMLVideoElement.prototype, 'mozHasAudio') ||
      // Chrome-likes
      Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'webkitAudioDecodedByteCount') ||
      // Future spec, still not supported in Nightly 63 as of 08/2018
      Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'audioTracks')
    }
  },
  components: {
    BooleanSetting,
    ChoiceSetting,
    IntegerSetting,
    InterfaceLanguageSwitcher,
    ScopeSelector,
    ServerSideIndicator
  },
  computed: {
    postFormats () {
      return this.$store.state.instance.postFormats || []
    },
    postContentOptions () {
      return this.postFormats.map(format => ({
        key: format,
        value: format,
        label: this.$t(`post_status.content_type["${format}"]`)
      }))
    },
    instanceSpecificPanelPresent () { return this.$store.state.instance.showInstanceSpecificPanel },
    instanceWallpaperUsed () {
      return this.$store.state.instance.background &&
        !this.$store.state.users.currentUser.background_image
    },
    instanceShoutboxPresent () { return this.$store.state.instance.shoutAvailable },
    language: {
      get: function () { return this.$store.getters.mergedConfig.interfaceLanguage },
      set: function (val) {
        this.$store.dispatch('setOption', { name: 'interfaceLanguage', value: val })
      }
    },
    ...SharedComputedObject()
  },
  methods: {
    changeDefaultScope (value) {
      this.$store.dispatch('setServerSideOption', { name: 'defaultScope', value })
    }
  }
}

export default GeneralTab
