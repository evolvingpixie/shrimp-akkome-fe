import Popover from '../popover/popover.vue'
import TimelineMenuContent from './timeline_menu_content.vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faChevronDown
} from '@fortawesome/free-solid-svg-icons'
import { mapState } from 'vuex'
import {
  publicTimelineVisible,
  federatedTimelineVisible,
  bubbleTimelineVisible,
} from '../../lib/timeline_visibility'

library.add(faChevronDown)

// Route -> i18n key mapping, exported and not in the computed
// because nav panel benefits from the same information.
export const timelineNames = () => {
  return {
    'friends': 'nav.home_timeline',
    'bookmarks': 'nav.bookmarks',
    'dms': 'nav.dms',
    'public-timeline': 'nav.public_tl',
    'public-external-timeline': 'nav.twkn',
    'bubble-timeline': 'nav.bubble_timeline'
  }
}

const TimelineMenuTabs = {
  components: {
    Popover,
    TimelineMenuContent
  },
  data () {
    return {
      isOpen: false
    }
  },
  created () {
    if (timelineNames()[this.$route.name]) {
      this.$store.dispatch('setLastTimeline', this.$route.name)
    }
  },
  computed: {
    privateMode () {
      return this.$store.state.instance.private
    },
    ...mapState({
      currentUser: state => state.users.currentUser,
      publicTimelineVisible,
      federatedTimelineVisible,
      bubbleTimelineVisible,
    })
  },
  methods: {
    timelineName () {
      const route = this.$route.name
      if (route === 'tag-timeline') {
        return '#' + this.$route.params.tag
      }
      if (route === 'list-timeline') {
        return this.$store.getters.findListTitle(this.$route.params.id)
      }
      const i18nkey = timelineNames()[this.$route.name]
      return i18nkey ? this.$t(i18nkey) : route
    }
  }
}

export default TimelineMenuTabs
