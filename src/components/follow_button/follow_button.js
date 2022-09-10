import ConfirmModal from '../confirm_modal/confirm_modal.vue'
import { requestFollow, requestUnfollow } from '../../services/follow_manipulate/follow_manipulate'
export default {
  props: ['relationship', 'user', 'labelFollowing', 'buttonClass'],
  components: {
    ConfirmModal
  },
  data () {
    return {
      inProgress: false,
      showingConfirmUnfollow: false
    }
  },
  computed: {
    shouldConfirmUnfollow () {
      return this.$store.getters.mergedConfig.modalOnUnfollow
    },
    isPressed () {
      return this.inProgress || this.relationship.following
    },
    title () {
      if (this.inProgress || this.relationship.following) {
        return this.$t('user_card.follow_unfollow')
      } else if (this.relationship.requested) {
        return this.$t('user_card.follow_cancel')
      } else {
        return this.$t('user_card.follow')
      }
    },
    label () {
      if (this.inProgress) {
        return this.$t('user_card.follow_progress')
      } else if (this.relationship.following) {
        return this.labelFollowing || this.$t('user_card.following')
      } else if (this.relationship.requested) {
        return this.$t('user_card.follow_sent')
      } else {
        return this.$t('user_card.follow')
      }
    },
    disabled () {
      return this.inProgress || this.user.deactivated
    }
  },
  methods: {
    showConfirmUnfollow () {
      this.showingConfirmUnfollow = true
    },
    hideConfirmUnfollow () {
      this.showingConfirmUnfollow = false
    },
    onClick () {
      this.relationship.following || this.relationship.requested ? this.unfollow() : this.follow()
    },
    follow () {
      this.inProgress = true
      requestFollow(this.relationship.id, this.$store).then(() => {
        this.inProgress = false
      })
    },
    unfollow () {
      if (this.shouldConfirmUnfollow) {
        this.showConfirmUnfollow()
      } else {
        this.doUnfollow()
      }
    },
    doUnfollow () {
      const store = this.$store
      this.inProgress = true
      requestUnfollow(this.relationship.id, store).then(() => {
        this.inProgress = false
        store.commit('removeStatus', { timeline: 'friends', userId: this.relationship.id })
      })

      this.hideConfirmUnfollow()
    }
  }
}
