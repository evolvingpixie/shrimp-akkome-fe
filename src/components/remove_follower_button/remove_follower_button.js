export default {
  props: ['relationship'],
  data () {
    return {
      inProgress: false
    }
  },
  computed: {
    label () {
      if (this.inProgress) {
        return this.$t('user_card.follow_progress')
      } else {
        return this.$t('user_card.remove_follower')
      }
    }
  },
  methods: {
    onClick () {
      this.inProgress = true
      this.$store.dispatch('removeUserFromFollowers', this.relationship.id).then(() => {
        this.inProgress = false
      })
    }
  }
}
