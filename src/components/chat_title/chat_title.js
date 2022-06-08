import generateProfileLink from 'src/services/user_profile_link_generator/user_profile_link_generator'
import UserAvatar from '../user_avatar/user_avatar.vue'
import RichContent from 'src/components/rich_content/rich_content.jsx'

export default {
  name: 'ChatTitle',
  components: {
    UserAvatar,
    RichContent
  },
  props: [
    'user', 'withAvatar'
  ],
  computed: {
    title () {
      return this.user ? this.user.screen_name_ui : ''
    },
    htmlTitle () {
      return this.user ? this.user.name_html : ''
    }
  },
  methods: {
    getUserProfileLink (user) {
      return generateProfileLink(user.id, user.screen_name)
    }
  }
}
