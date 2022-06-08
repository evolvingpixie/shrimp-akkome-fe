import Attachment from '../attachment/attachment.vue'
import Poll from '../poll/poll.vue'
import Gallery from '../gallery/gallery.vue'
import StatusBody from 'src/components/status_body/status_body.vue'
import LinkPreview from '../link-preview/link-preview.vue'
import { mapGetters, mapState } from 'vuex'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faCircleNotch,
  faFile,
  faMusic,
  faImage,
  faLink,
  faPollH
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faCircleNotch,
  faFile,
  faMusic,
  faImage,
  faLink,
  faPollH
)

const camelCase = name => name.charAt(0).toUpperCase() + name.slice(1)

const controlledOrUncontrolledGetters = list => list.reduce((res, name) => {
  const camelized = camelCase(name)
  const toggle = `controlledToggle${camelized}`
  const controlledName = `controlled${camelized}`
  const uncontrolledName = `uncontrolled${camelized}`
  res[name] = function () {
    return ((this.$data[toggle] !== undefined || this.$props[toggle] !== undefined) && this[toggle]) ? this[controlledName] : this[uncontrolledName]
  }
  return res
}, {})

const controlledOrUncontrolledToggle = (obj, name) => {
  const camelized = camelCase(name)
  const toggle = `controlledToggle${camelized}`
  const uncontrolledName = `uncontrolled${camelized}`
  if (obj[toggle]) {
    obj[toggle]()
  } else {
    obj[uncontrolledName] = !obj[uncontrolledName]
  }
}

const StatusContent = {
  name: 'StatusContent',
  props: [
    'status',
    'compact',
    'focused',
    'noHeading',
    'fullContent',
    'singleLine',
    'controlledShowingTall',
    'controlledExpandingSubject',
    'controlledToggleShowingTall',
    'controlledToggleExpandingSubject',
    'controlledShowingLongSubject',
    'controlledToggleShowingLongSubject'
  ],
  data () {
    return {
      uncontrolledShowingTall: this.fullContent || (this.inConversation && this.focused),
      uncontrolledShowingLongSubject: false,
      // not as computed because it sets the initial state which will be changed later
      uncontrolledExpandingSubject: !this.$store.getters.mergedConfig.collapseMessageWithSubject
    }
  },
  computed: {
    ...controlledOrUncontrolledGetters(['showingTall', 'expandingSubject', 'showingLongSubject']),
    hideAttachments () {
      return (this.mergedConfig.hideAttachments && !this.inConversation) ||
        (this.mergedConfig.hideAttachmentsInConv && this.inConversation)
    },
    nsfwClickthrough () {
      if (!this.status.nsfw) {
        return false
      }
      if (this.status.summary && this.localCollapseSubjectDefault) {
        return false
      }
      return true
    },
    attachmentSize () {
      if (this.compact) {
        return 'small'
      } else if ((this.mergedConfig.hideAttachments && !this.inConversation) ||
        (this.mergedConfig.hideAttachmentsInConv && this.inConversation) ||
        (this.status.attachments.length > this.maxThumbnails)) {
        return 'hide'
      }
      return 'normal'
    },
    maxThumbnails () {
      return this.mergedConfig.maxThumbnails
    },
    ...mapGetters(['mergedConfig']),
    ...mapState({
      currentUser: state => state.users.currentUser
    })
  },
  components: {
    Attachment,
    Poll,
    Gallery,
    LinkPreview,
    StatusBody
  },
  methods: {
    toggleShowingTall () {
      controlledOrUncontrolledToggle(this, 'showingTall')
    },
    toggleExpandingSubject () {
      controlledOrUncontrolledToggle(this, 'expandingSubject')
    },
    toggleShowingLongSubject () {
      controlledOrUncontrolledToggle(this, 'showingLongSubject')
    },
    setMedia () {
      const attachments = this.attachmentSize === 'hide' ? this.status.attachments : this.galleryAttachments
      return () => this.$store.dispatch('setMedia', attachments)
    }
  }
}

export default StatusContent
