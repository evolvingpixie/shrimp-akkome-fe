import ListCard from '../list_card/list_card.vue'

const Lists = {
  components: {
    ListCard
  },
  created () {
    this.$store.dispatch('startFetchingLists')
  },
  computed: {
    lists () {
      return this.$store.state.api.lists
    }
  }
}

export default Lists
