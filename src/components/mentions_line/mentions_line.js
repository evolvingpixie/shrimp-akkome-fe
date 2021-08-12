import MentionLink from 'src/components/mention_link/mention_link.vue'
import { mapGetters } from 'vuex'

const MentionsLine = {
  name: 'MentionsLine',
  props: {
    mentions: {
      required: true,
      type: Array
    }
  },
  data: () => ({ expanded: false }),
  components: {
    MentionLink
  },
  computed: {
    limit () {
      return 5
    },
    mentionsComputed () {
      return this.mentions.slice(0, this.limit)
    },
    extraMentions () {
      return this.mentions.slice(this.limit)
    },
    manyMentions () {
      return this.extraMentions.length > 0
    },
    ...mapGetters(['mergedConfig'])
  },
  methods: {
    toggleShowMore () {
      this.expanded = !this.expanded
    }
  }
}

export default MentionsLine
