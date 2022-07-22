import Timeline from '../timeline/timeline.vue'
const PublicTimeline = {
  components: {
    Timeline
  },
  computed: {
    timeline () { return this.$store.state.statuses.timelines.bubble }
  },
  created () {
    this.$store.dispatch('startFetchingTimeline', { timeline: 'bubble' })
  },
  unmounted () {
    this.$store.dispatch('stopFetchingTimeline', 'bubble')
  }

}

export default PublicTimeline
