import UserPanel from './components/user_panel/user_panel.vue'
import NavPanel from './components/nav_panel/nav_panel.vue'
import InstanceSpecificPanel from './components/instance_specific_panel/instance_specific_panel.vue'
import FeaturesPanel from './components/features_panel/features_panel.vue'
import WhoToFollowPanel from './components/who_to_follow_panel/who_to_follow_panel.vue'
import ShoutPanel from './components/shout_panel/shout_panel.vue'
import SettingsModal from './components/settings_modal/settings_modal.vue'
import MediaModal from './components/media_modal/media_modal.vue'
import SideDrawer from './components/side_drawer/side_drawer.vue'
import MobilePostStatusButton from './components/mobile_post_status_button/mobile_post_status_button.vue'
import MobileNav from './components/mobile_nav/mobile_nav.vue'
import DesktopNav from './components/desktop_nav/desktop_nav.vue'
import UserReportingModal from './components/user_reporting_modal/user_reporting_modal.vue'
import PostStatusModal from './components/post_status_modal/post_status_modal.vue'
import GlobalNoticeList from './components/global_notice_list/global_notice_list.vue'
import { windowWidth, windowHeight } from './services/window_utils/window_utils'
import { mapGetters } from 'vuex'
import { defineAsyncComponent } from 'vue'

export default {
  name: 'app',
  components: {
    UserPanel,
    NavPanel,
    Notifications: defineAsyncComponent(() => import('./components/notifications/notifications.vue')),
    InstanceSpecificPanel,
    FeaturesPanel,
    WhoToFollowPanel,
    ShoutPanel,
    MediaModal,
    SideDrawer,
    MobilePostStatusButton,
    MobileNav,
    DesktopNav,
    SettingsModal,
    UserReportingModal,
    PostStatusModal,
    GlobalNoticeList
  },
  data: () => ({
    mobileActivePanel: 'timeline'
  }),
  created () {
    // Load the locale from the storage
    const val = this.$store.getters.mergedConfig.interfaceLanguage
    this.$store.dispatch('setOption', { name: 'interfaceLanguage', value: val })
    window.addEventListener('resize', this.updateMobileState)
  },
  unmounted () {
    window.removeEventListener('resize', this.updateMobileState)
  },
  computed: {
    classes () {
      return [
        {
          '-reverse': this.reverseLayout,
          '-no-sticky-headers': this.noSticky,
          '-has-new-post-button': this.newPostButtonShown
        },
        '-' + this.layoutType
      ]
    },
    currentUser () { return this.$store.state.users.currentUser },
    userBackground () { return this.currentUser.background_image },
    instanceBackground () {
      return this.mergedConfig.hideInstanceWallpaper
        ? null
        : this.$store.state.instance.background
    },
    background () { return this.userBackground || this.instanceBackground },
    bgStyle () {
      if (this.background) {
        return {
          '--body-background-image': `url(${this.background})`
        }
      }
    },
    shout () { return this.$store.state.shout.joined },
    suggestionsEnabled () { return this.$store.state.instance.suggestionsEnabled },
    showInstanceSpecificPanel () {
      return this.$store.state.instance.showInstanceSpecificPanel &&
        !this.$store.getters.mergedConfig.hideISP &&
        this.$store.state.instance.instanceSpecificPanelContent
    },
    isChats () {
      return this.$route.name === 'chat' || this.$route.name === 'chats'
    },
    newPostButtonShown () {
      if (this.isChats) return false
      return this.$store.getters.mergedConfig.alwaysShowNewPostButton || this.layoutType === 'mobile'
    },
    showFeaturesPanel () { return this.$store.state.instance.showFeaturesPanel },
    shoutboxPosition () {
      return this.$store.getters.mergedConfig.alwaysShowNewPostButton || false
    },
    hideShoutbox () {
      return this.$store.getters.mergedConfig.hideShoutbox
    },
    layoutType () { return this.$store.state.interface.layoutType },
    privateMode () { return this.$store.state.instance.private },
    reverseLayout () {
      const { thirdColumnMode, sidebarRight: reverseSetting } = this.$store.getters.mergedConfig
      if (this.layoutType !== 'wide') {
        return reverseSetting
      } else {
        return thirdColumnMode === 'notifications' ? reverseSetting : !reverseSetting
      }
    },
    noSticky () { return this.$store.getters.mergedConfig.disableStickyHeaders },
    showScrollbars () { return this.$store.getters.mergedConfig.showScrollbars },
    ...mapGetters(['mergedConfig'])
  },
  methods: {
    updateMobileState () {
      this.$store.dispatch('setLayoutWidth', windowWidth())
      this.$store.dispatch('setLayoutHeight', windowHeight())
    }
  }
}
