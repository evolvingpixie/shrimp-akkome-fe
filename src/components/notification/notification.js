import StatusContent from '../status_content/status_content.vue'
import { mapState } from 'vuex'
import Status from '../status/status.vue'
import UserAvatar from '../user_avatar/user_avatar.vue'
import UserCard from '../user_card/user_card.vue'
import Timeago from '../timeago/timeago.vue'
import RichContent from 'src/components/rich_content/rich_content.jsx'
import ConfirmModal from '../confirm_modal/confirm_modal.vue'
import StillImage from '../still-image/still-image.vue'
import { isStatusNotification } from '../../services/notification_utils/notification_utils.js'
import { highlightClass, highlightStyle } from '../../services/user_highlighter/user_highlighter.js'
import generateProfileLink from 'src/services/user_profile_link_generator/user_profile_link_generator'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faCheck,
  faTimes,
  faStar,
  faRetweet,
  faUserPlus,
  faEyeSlash,
  faUser,
  faSuitcaseRolling
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faCheck,
  faTimes,
  faStar,
  faRetweet,
  faUserPlus,
  faUser,
  faEyeSlash,
  faSuitcaseRolling
)

const Notification = {
  data () {
    return {
      userExpanded: false,
      betterShadow: this.$store.state.interface.browserSupport.cssFilter,
      unmuted: false,
      showingApproveConfirmDialog: false,
      showingDenyConfirmDialog: false
    }
  },
  props: [ 'notification' ],
  components: {
    StatusContent,
    UserAvatar,
    UserCard,
    Timeago,
    Status,
    RichContent,
    ConfirmModal,
    StillImage
  },
  methods: {
    toggleUserExpanded () {
      this.userExpanded = !this.userExpanded
    },
    generateUserProfileLink (user) {
      return generateProfileLink(user.id, user.screen_name, this.$store.state.instance.restrictedNicknames)
    },
    getUser (notification) {
      return this.$store.state.users.usersObject[notification.from_profile.id]
    },
    toggleMute () {
      this.unmuted = !this.unmuted
    },
    showApproveConfirmDialog () {
      this.showingApproveConfirmDialog = true
    },
    hideApproveConfirmDialog () {
      this.showingApproveConfirmDialog = false
    },
    showDenyConfirmDialog () {
      this.showingDenyConfirmDialog = true
    },
    hideDenyConfirmDialog () {
      this.showingDenyConfirmDialog = false
    },
    approveUser () {
      if (this.shouldConfirmApprove) {
        this.showApproveConfirmDialog()
      } else {
        this.doApprove()
      }
    },
    doApprove () {
      this.$store.state.api.backendInteractor.approveUser({ id: this.user.id })
      this.$store.dispatch('removeFollowRequest', this.user)
      this.$store.dispatch('markSingleNotificationAsSeen', { id: this.notification.id })
      this.$store.dispatch('updateNotification', {
        id: this.notification.id,
        updater: notification => {
          notification.type = 'follow'
        }
      })
      this.hideApproveConfirmDialog()
    },
    denyUser () {
      if (this.shouldConfirmDeny) {
        this.showDenyConfirmDialog()
      } else {
        this.doDeny()
      }
    },
    doDeny () {
      this.$store.state.api.backendInteractor.denyUser({ id: this.user.id })
        .then(() => {
          this.$store.dispatch('dismissNotificationLocal', { id: this.notification.id })
          this.$store.dispatch('removeFollowRequest', this.user)
        })
      this.hideDenyConfirmDialog()
    }
  },
  computed: {
    userClass () {
      return highlightClass(this.notification.from_profile)
    },
    userStyle () {
      const highlight = this.$store.getters.mergedConfig.highlight
      const user = this.notification.from_profile
      return highlightStyle(highlight[user.screen_name])
    },
    user () {
      return this.$store.getters.findUser(this.notification.from_profile.id)
    },
    userProfileLink () {
      return this.generateUserProfileLink(this.user)
    },
    targetUser () {
      return this.$store.getters.findUser(this.notification.target.id)
    },
    targetUserProfileLink () {
      return this.generateUserProfileLink(this.targetUser)
    },
    needMute () {
      return this.$store.getters.relationship(this.user.id).muting
    },
    isStatusNotification () {
      return isStatusNotification(this.notification.type)
    },
    mergedConfig () {
      return this.$store.getters.mergedConfig
    },
    shouldConfirmApprove () {
      return this.mergedConfig.modalOnApproveFollow
    },
    shouldConfirmDeny () {
      return this.mergedConfig.modalOnDenyFollow
    },
    ...mapState({
      currentUser: state => state.users.currentUser
    })
  }
}

export default Notification
