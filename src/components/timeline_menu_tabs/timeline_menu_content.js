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
      showBubbleTimeline: state => (state.instance.localBubbleInstances.length > 0),
      publicTimelineVisibility: state => state.instance.publicTimelineVisibility,
      federatedTimelineAvailable: state => state.instance.federatedTimelineAvailable,
    })
  }
}

export default TimelineMenuContent
