import generateProfileLink from 'src/services/user_profile_link_generator/user_profile_link_generator'
import { mapGetters, mapState } from 'vuex'
import { highlightClass, highlightStyle } from '../../services/user_highlighter/user_highlighter.js'

const MentionLink = {
  name: 'MentionLink',
  props: {
    url: {
      required: true,
      type: String
    },
    content: {
      required: true,
      type: String
    },
    firstMention: {
      required: false,
      type: Boolean,
      default: false
    }
  },
  methods: {
    onClick () {
      const link = generateProfileLink(this.user.id, this.user.screen_name)
      this.$router.push(link)
    }
  },
  computed: {
    user () {
      return this.$store.getters.findUserByUrl(this.url)
    },
    isYou () {
      // FIXME why user !== currentUser???
      return this.user.screen_name === this.currentUser.screen_name
    },
    userName () {
      return this.userNameFullUi.split('@')[0]
    },
    userNameFull () {
      return this.user.screen_name
    },
    userNameFullUi () {
      return this.user.screen_name_ui
    },
    highlight () {
      return this.mergedConfig.highlight[this.user.screen_name]
    },
    highlightType () {
      return this.highlight && ('-' + this.highlight.type)
    },
    highlightClass () {
      if (this.highlight) return highlightClass(this.user)
    },
    oldPlace () {
      return !this.mergedConfig.mentionsOwnLine
    },
    oldStyle () {
      return !this.mergedConfig.mentionsNewStyle
    },
    style () {
      if (this.highlight) {
        const {
          backgroundColor,
          backgroundPosition,
          backgroundImage,
          ...rest
        } = highlightStyle(this.highlight)
        return rest
      }
    },
    classnames () {
      return [
        {
          '-you': this.isYou,
          '-highlighted': this.highlight,
          '-firstMention': this.firstMention,
          '-oldStyle': this.oldStyle
        },
        this.highlightType
      ]
    },
    ...mapGetters(['mergedConfig']),
    ...mapState({
      currentUser: state => state.users.currentUser
    })
  }
}

export default MentionLink
