import TabSwitcher from 'src/components/tab_switcher/tab_switcher.jsx'

import ReportsTab from './tabs/reports_tab/reports_tab.vue'
// import StatusesTab from './tabs/statuses_tab.vue'
// import UsersTab from './tabs/users_tab.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faFlag,
  faMessage,
  faUsers
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faFlag,
  faMessage,
  faUsers
)

const ModModalContent = {
  components: {
    TabSwitcher,

    ReportsTab
    // StatusesTab,
    // UsersTab
  },
  computed: {
    open () {
      return this.$store.state.interface.modModalState !== 'hidden'
    },
    bodyLock () {
      return this.$store.state.interface.modModalState === 'visible'
    }
  },
  methods: {
    onOpen () {
      const targetTab = this.$store.state.interface.modModalTargetTab
      // We're being told to open in specific tab
      if (targetTab) {
        const tabIndex = this.$refs.tabSwitcher.$slots.default().findIndex(elm => {
          return elm.props && elm.props['data-tab-name'] === targetTab
        })
        if (tabIndex >= 0) {
          this.$refs.tabSwitcher.setTab(tabIndex)
        }
      }
      // Clear the state of target tab, so that next time moderation is opened
      // it doesn't force it.
      this.$store.dispatch('clearModModalTargetTab')
    }
  },
  mounted () {
    this.onOpen()
  },
  watch: {
    open: function (value) {
      if (value) this.onOpen()
    }
  }
}

export default ModModalContent
