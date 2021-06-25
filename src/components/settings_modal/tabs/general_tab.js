import BooleanSetting from '../helpers/boolean_setting.vue'
import ChoiceSetting from '../helpers/choice_setting.vue'
import InterfaceLanguageSwitcher from 'src/components/interface_language_switcher/interface_language_switcher.vue'

import SharedComputedObject from '../helpers/shared_computed_object.js'
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
    InterfaceLanguageSwitcher
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
    ...SharedComputedObject()
  }
}

export default GeneralTab
