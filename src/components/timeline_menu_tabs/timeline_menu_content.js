import { mapState } from 'vuex'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faUsers,
  faGlobe,
  faBookmark,
  faEnvelope,
  faHome
} from '@fortawesome/free-solid-svg-icons'
import { faCircle } from '@fortawesome/free-regular-svg-icons'
import { federatedTimelineVisible, publicTimelineVisible, bubbleTimelineVisible } from '../../lib/timeline_visibility'
library.add(
  faUsers,
  faGlobe,
  faBookmark,
  faEnvelope,
  faHome,
  faCircle
)

const TimelineMenuContent = {
  computed: {
    ...mapState({
      currentUser: state => state.users.currentUser,
      privateMode: state => state.instance.private,
      federating: state => state.instance.federating,
      publicTimelineVisible,
      federatedTimelineVisible,
      bubbleTimelineVisible,
    })
  }
}

export default TimelineMenuContent
