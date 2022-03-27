import { defineAsyncComponent } from 'vue'
import RichContent from 'src/components/rich_content/rich_content.jsx'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'

library.add(
  faCircleNotch
)

const UserListPopover = {
  name: 'UserListPopover',
  props: [
    'users'
  ],
  components: {
    RichContent,
    Popover: defineAsyncComponent(() => import('../popover/popover.vue')),
    UserAvatar: defineAsyncComponent(() => import('../user_avatar/user_avatar.vue'))
  },
  computed: {
    usersCapped () {
      return this.users.slice(0, 16)
    }
  }
}

export default UserListPopover
