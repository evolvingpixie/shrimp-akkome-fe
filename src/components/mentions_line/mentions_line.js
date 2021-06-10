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
    oldStyle () {
      return !this.mergedConfig.mentionsNewStyle
    },
    limit () {
      return 6
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
    buttonClasses () {
      return [
        this.oldStyle
          ? 'button-unstyled'
          : 'button-default -sublime',
        this.oldStyle
          ? '-oldStyle'
          : '-newStyle'
      ]
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
