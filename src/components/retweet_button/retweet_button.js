import ConfirmModal from '../confirm_modal/confirm_modal.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faRetweet } from '@fortawesome/free-solid-svg-icons'

library.add(faRetweet)

const RetweetButton = {
  props: ['status', 'loggedIn', 'visibility'],
  components: {
    ConfirmModal
  },
  data () {
    return {
      animated: false,
      showingConfirmDialog: false
    }
  },
  methods: {
    retweet () {
      if (!this.status.repeated && this.shouldConfirmRepeat) {
        this.showConfirmDialog()
      } else {
        this.doRetweet()
      }
    },
    doRetweet () {
      if (!this.status.repeated) {
        this.$store.dispatch('retweet', { id: this.status.id })
      } else {
        this.$store.dispatch('unretweet', { id: this.status.id })
      }
      this.animated = true
      setTimeout(() => {
        this.animated = false
      }, 500)
      this.hideConfirmDialog()
    },
    showConfirmDialog () {
      this.showingConfirmDialog = true
    },
    hideConfirmDialog () {
      this.showingConfirmDialog = false
    }
  },
  computed: {
    isOwn () {
      return this.status.user.id === this.$store.state.users.currentUser.id
    },
    mergedConfig () {
      return this.$store.getters.mergedConfig
    },
    shouldConfirmRepeat () {
      return this.mergedConfig.modalOnRepeat
    }
  }
}

export default RetweetButton
