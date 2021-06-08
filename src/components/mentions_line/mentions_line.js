import MentionLink from 'src/components/mention_link/mention_link.vue'
import { mapGetters } from 'vuex'

const MentionsLine = {
  name: 'MentionsLine',
  props: {
    attentions: {
      required: true,
      type: Object
    }
  },
  data: () => ({ expanded: false }),
  components: {
    MentionLink
  },
  computed: {
    oldStyle () {
      return this.mergedConfig.mentionsOldStyle
    },
    limit () {
      return 6
    },
    mentions () {
      return this.attentions.slice(0, this.limit)
    },
    extraMentions () {
      return this.attentions.slice(this.limit)
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
    ...mapGetters(['mergedConfig']),
  },
  methods: {
    toggleShowMore () {
      this.expanded = !this.expanded
    }
  }
}

export default MentionsLine
