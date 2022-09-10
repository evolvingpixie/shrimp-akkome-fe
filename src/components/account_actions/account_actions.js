import ProgressButton from '../progress_button/progress_button.vue'
import Popover from '../popover/popover.vue'
import ConfirmModal from '../confirm_modal/confirm_modal.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { mapState } from 'vuex'
import {
  faEllipsisV
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faEllipsisV
)

const AccountActions = {
  props: [
    'user', 'relationship'
  ],
  data () {
    return {
      showingConfirmBlock: false
    }
  },
  components: {
    ProgressButton,
    Popover,
    ConfirmModal
  },
  methods: {
    showConfirmBlock () {
      this.showingConfirmBlock = true
    },
    hideConfirmBlock () {
      this.showingConfirmBlock = false
    },
    showRepeats () {
      this.$store.dispatch('showReblogs', this.user.id)
    },
    hideRepeats () {
      this.$store.dispatch('hideReblogs', this.user.id)
    },
    blockUser () {
      if (!this.shouldConfirmBlock) {
        this.doBlockUser()
      } else {
        this.showConfirmBlock()
      }
    },
    doBlockUser () {
      this.$store.dispatch('blockUser', this.user.id)
      this.hideConfirmBlock()
    },
    unblockUser () {
      this.$store.dispatch('unblockUser', this.user.id)
    },
    reportUser () {
      this.$store.dispatch('openUserReportingModal', { userId: this.user.id })
    }
  },
  computed: {
    shouldConfirmBlock () {
      return this.$store.getters.mergedConfig.modalOnBlock
    },
    ...mapState({
      pleromaChatMessagesAvailable: state => state.instance.pleromaChatMessagesAvailable
    })
  }
}

export default AccountActions
