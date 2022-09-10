import SideDrawer from '../side_drawer/side_drawer.vue'
import Notifications from '../notifications/notifications.vue'
import ConfirmModal from '../confirm_modal/confirm_modal.vue'
import { unseenNotificationsFromStore } from '../../services/notification_utils/notification_utils'
import GestureService from '../../services/gesture_service/gesture_service'
import { mapGetters } from 'vuex'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faTimes,
  faBell,
  faBars
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faTimes,
  faBell,
  faBars
)

const MobileNav = {
  components: {
    SideDrawer,
    Notifications,
    ConfirmModal
  },
  data: () => ({
    notificationsCloseGesture: undefined,
    notificationsOpen: false,
    showingConfirmLogout: false
  }),
  created () {
    this.notificationsCloseGesture = GestureService.swipeGesture(
      GestureService.DIRECTION_RIGHT,
      this.closeMobileNotifications,
      50
    )
  },
  computed: {
    currentUser () {
      return this.$store.state.users.currentUser
    },
    unseenNotifications () {
      return unseenNotificationsFromStore(this.$store)
    },
    unseenNotificationsCount () {
      return this.unseenNotifications.length
    },
    mergedConfig () {
      return this.$store.getters.mergedConfig
    },
    hideSiteName () {
      return this.mergedConfig.hideSiteName
    },
    sitename () { return this.$store.state.instance.name },
    shouldConfirmLogout () {
      return this.$store.getters.mergedConfig.modalOnLogout
    },
    ...mapGetters(['unreadChatCount'])
  },
  methods: {
    toggleMobileSidebar () {
      this.$refs.sideDrawer.toggleDrawer()
    },
    openMobileNotifications () {
      this.notificationsOpen = true
    },
    closeMobileNotifications () {
      if (this.notificationsOpen) {
        // make sure to mark notifs seen only when the notifs were open and not
        // from close-calls.
        this.notificationsOpen = false
        this.markNotificationsAsSeen()
      }
    },
    notificationsTouchStart (e) {
      GestureService.beginSwipe(e, this.notificationsCloseGesture)
    },
    notificationsTouchMove (e) {
      GestureService.updateSwipe(e, this.notificationsCloseGesture)
    },
    scrollToTop () {
      window.scrollTo(0, 0)
    },
    showConfirmLogout () {
      this.showingConfirmLogout = true
    },
    hideConfirmLogout () {
      this.showingConfirmLogout = false
    },
    logout () {
      if (!this.shouldConfirmLogout) {
        this.doLogout()
      } else {
        this.showConfirmLogout()
      }
    },
    doLogout () {
      this.$router.replace('/main/public')
      this.$store.dispatch('logout')
      this.hideConfirmLogout()
    },
    markNotificationsAsSeen () {
      // this.$refs.notifications.markAsSeen()
      this.$store.dispatch('markNotificationsAsSeen')
    },
    onScroll ({ target: { scrollTop, clientHeight, scrollHeight } }) {
      if (scrollTop + clientHeight >= scrollHeight) {
        this.$refs.notifications.fetchOlderNotifications()
      }
    }
  },
  watch: {
    $route () {
      // handles closing notificaitons when you press any router-link on the
      // notifications.
      this.closeMobileNotifications()
    }
  }
}

export default MobileNav
