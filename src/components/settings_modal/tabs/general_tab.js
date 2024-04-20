import BooleanSetting from '../helpers/boolean_setting.vue'
import ChoiceSetting from '../helpers/choice_setting.vue'
import ScopeSelector from 'src/components/scope_selector/scope_selector.vue'
import IntegerSetting from '../helpers/integer_setting.vue'
import InterfaceLanguageSwitcher from 'src/components/interface_language_switcher/interface_language_switcher.vue'

import { usePostLanguageOptions } from 'src/lib/post_language'
import SharedComputedObject from '../helpers/shared_computed_object.js'
import ServerSideIndicator from '../helpers/server_side_indicator.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faGlobe, faSync
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faGlobe,
  faSync
)

const GeneralTab = {
  setup() {
    const {postLanguageOptions} = usePostLanguageOptions()

    return {postLanguageOptions}
  },
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
      userProfileDefaultTabOptions: ['statuses', 'replies'].map(tab => ({
        key: tab,
        value: tab,
        label: this.$t(`user_card.${tab}`)
      })),
      profilesExpanded: false,
      newProfileName: '',
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
    language: {
      get: function () { return this.$store.getters.mergedConfig.interfaceLanguage },
      set: function (val) {
        this.$store.dispatch('setOption', { name: 'interfaceLanguage', value: val })
      }
    },
    settingsProfiles () {
      return (this.$store.state.instance.settingsProfiles || [])
    },
    settingsProfile: {
      get: function () { return this.$store.getters.mergedConfig.profile },
      set: function (val) {
        this.$store.dispatch('setOption', { name: 'profile', value: val })
        this.$store.dispatch('getSettingsProfile')
      }
    },
    settingsVersion () {
      return this.$store.getters.mergedConfig.profileVersion
    },
    translationLanguages () {
      const langs = this.$store.state.instance.supportedTranslationLanguages
      if (langs && langs.source) {
        return langs.source.map(lang => ({ key: lang.code, value: lang.code, label: lang.name }))
      }

      return []
    },
    translationLanguage: {
      get: function () { return this.$store.getters.mergedConfig.translationLanguage },
      set: function (val) {
        this.$store.dispatch('setOption', { name: 'translationLanguage', value: val })
      }
    },
    postLanguage: {
      get: function () { return this.$store.getters.mergedConfig.postLanguage },
      set: function (val) {
        this.$store.dispatch('setOption', { name: 'postLanguage', value: val })
      }
    },
    ...SharedComputedObject()
  },
  methods: {
    changeDefaultScope (value) {
      this.$store.dispatch('setServerSideOption', { name: 'defaultScope', value })
    },
    setTranslationLanguage (value) {
      this.$store.dispatch('setOption', { name: 'translationLanguage', value })
    },
    toggleExpandedSettings () {
      this.profilesExpanded = !this.profilesExpanded
    },
    loadSettingsProfile (name) {
      this.$store.commit('setOption', { name: 'profile', value: name })
      this.$store.dispatch('getSettingsProfile', true)
    },
    createSettingsProfile () {
      this.$store.dispatch('setOption', { name: 'profile', value: this.newProfileName })
      this.$store.dispatch('setOption', { name: 'profileVersion', value: 1 })
      this.$store.dispatch('syncSettings')
      this.newProfileName = ''
    },
    forceSync () {
      this.$store.dispatch('getSettingsProfile')
    },
    refreshProfiles () {
      this.$store.dispatch('listSettingsProfiles')
    },
    deleteSettingsProfile (name) {
      if (confirm(this.$t('settings.settings_profile_delete_confirm'))) {
        this.$store.dispatch('deleteSettingsProfile', name)
      }
    }
  }
}

export default GeneralTab
