import generateProfileLink from 'src/services/user_profile_link_generator/user_profile_link_generator'
import { getTextColor, rgb2hex } from 'src/services/color_convert/color_convert.js'
import { mapGetters, mapState } from 'vuex'
import { convert } from 'chromatism'

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
    origattrs: {
      required: true,
      type: Object
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
    bg () {
      if (this.highlight) return this.highlight.color
    },
    text () {
      if (this.bg) {
        const linkColor = this.mergedConfig.customTheme.colors.link
        const color = getTextColor(convert(this.bg).rgb, convert(linkColor).rgb)
        return rgb2hex(color)
      }
    },
    style () {
      return [
        this.bg && `--mention-bg: ${this.bg}`,
        this.text && `--mention-text: ${this.text}`
      ].filter(_ => _).join('; ')
    },
    ...mapGetters(['mergedConfig']),
    ...mapState({
      currentUser: state => state.users.currentUser
    })
  }
}

export default MentionLink
