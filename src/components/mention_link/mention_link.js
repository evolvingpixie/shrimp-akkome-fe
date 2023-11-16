import generateProfileLink from 'src/services/user_profile_link_generator/user_profile_link_generator'
import { mapGetters, mapState } from 'vuex'
import { highlightClass, highlightStyle } from '../../services/user_highlighter/user_highlighter.js'
import UserAvatar from '../user_avatar/user_avatar.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faAt
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faAt
)

const MentionLink = {
  name: 'MentionLink',
  components: {
    UserAvatar
  },
  props: {
    url: {
      required: true,
      type: String
    },
    content: {
      required: true,
      type: String
    },
    userId: {
      required: false,
      type: String
    },
    userScreenName: {
      required: false,
      type: String
    }
  },
  methods: {
    onClick () {
      const link = generateProfileLink(
        this.userId || this.user.id,
        this.userScreenName || this.user.screen_name
      )
      this.$router.push(link)
    }
  },
  computed: {
    user () {
      return this.url && this.$store && this.$store.getters.findUserByUrl(this.url)
    },
    isYou () {
      // FIXME why user !== currentUser???
      return this.user && this.user.id === this.currentUser.id
    },
    userName () {
      return this.user && this.userNameFullUi.split('@')[0]
    },
    serverName () {
      // XXX assumed that domain does not contain @
      return this.user && (this.userNameFullUi.split('@')[1] || this.$store.getters.instanceDomain)
    },
    userNameFull () {
      return this.user && this.user.screen_name
    },
    userNameFullUi () {
      return this.user && this.user.screen_name_ui
    },
    highlight () {
      return this.user && this.mergedConfig.highlight[this.user.screen_name]
    },
    highlightType () {
      return this.highlight && ('-' + this.highlight.type)
    },
    highlightClass () {
      if (this.highlight) return highlightClass(this.user)
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
          '-you': this.isYou && this.shouldBoldenYou,
          '-highlighted': this.highlight
        },
        this.highlightType
      ]
    },
    isRemote () {
      return this.userName !== this.userNameFull
    },
    shouldShowFullUserName () {
      const conf = this.mergedConfig.mentionLinkDisplay
      if (conf === 'short') {
        return false
      } else if (conf === 'full') {
        return true
      } else { // full_for_remote
        return this.isRemote
      }
    },
    shouldShowTooltip () {
      return this.mergedConfig.mentionLinkShowTooltip && this.mergedConfig.mentionLinkDisplay === 'short' && this.isRemote
    },
    shouldShowAvatar () {
      return this.mergedConfig.mentionLinkShowAvatar
    },
    shouldShowYous () {
      return this.mergedConfig.mentionLinkShowYous
    },
    shouldBoldenYou () {
      return this.mergedConfig.mentionLinkBoldenYou
    },
    shouldFadeDomain () {
      return this.mergedConfig.mentionLinkFadeDomain
    },
    ...mapGetters(['mergedConfig']),
    ...mapState({
      currentUser: state => state.users.currentUser
    })
  }
}

export default MentionLink
