import StillImage from '../still-image/still-image.vue'

import { library } from '@fortawesome/fontawesome-svg-core'

import {
  faRobot
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faRobot
)

const UserAvatar = {
  props: [
    'user',
    'betterShadow',
    'compact',
    'bot'
  ],
  data () {
    return {
      showPlaceholder: false,
      defaultAvatar: `${this.$store.state.instance.server + this.$store.state.instance.defaultAvatar}`
    }
  },
  components: {
    StillImage
  },
  methods: {
    imgSrc (src) {
      return (!src || this.showPlaceholder) ? this.defaultAvatar : src
    },
    imageLoadError () {
      this.showPlaceholder = true
    }
  }
}

export default UserAvatar
