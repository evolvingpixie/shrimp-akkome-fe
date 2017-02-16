import UserPanel from './components/user_panel/user_panel.vue'
import NavPanel from './components/nav_panel/nav_panel.vue'
import Notifications from './components/notifications/notifications.vue'
import StyleSwitcher from './components/style_switcher/style_switcher.vue'

export default {
  name: 'app',
  components: {
    UserPanel,
    NavPanel,
    Notifications,
    StyleSwitcher
  },
  data: () => ({
    mobileActivePanel: 'timeline'
  }),
  computed: {
    currentUser () { return this.$store.state.users.currentUser },
    background () {
      return this.currentUser.background_image || this.$store.state.config.background
    },
    style () { return { 'background-image': `url(${this.background})` } },
    sitename () { return this.$store.state.config.name }
  },
  methods: {
    activatePanel (panelName) {
      this.mobileActivePanel = panelName
    }
  }
}
