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

const StatusContent = {
  name: 'StatusContent',
  props: [
    'status',
    'compact',
    'focused',
    'noHeading',
    'fullContent',
    'singleLine'
  ],
  computed: {
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
  }
}

export default StatusContent
