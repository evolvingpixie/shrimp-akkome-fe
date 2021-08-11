import Attachment from '../attachment/attachment.vue'
import Poll from '../poll/poll.vue'
import Gallery from '../gallery/gallery.vue'
import StatusBody from 'src/components/status_body/status_body.vue'
import LinkPreview from '../link-preview/link-preview.vue'
import fileType from 'src/services/file_type/file_type.service'
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
      if ((this.mergedConfig.hideAttachments && !this.inConversation) ||
        (this.mergedConfig.hideAttachmentsInConv && this.inConversation) ||
        (this.status.attachments.length > this.maxThumbnails)) {
        return 'hide'
      } else if (this.compact) {
        return 'small'
      }
      return 'normal'
    },
    galleryTypes () {
      if (this.attachmentSize === 'hide') {
        return []
      }
      return this.mergedConfig.playVideosInModal
        ? ['image', 'video']
        : ['image']
    },
    galleryAttachments () {
      return this.status.attachments.filter(
        file => fileType.fileMatchesSomeType(this.galleryTypes, file)
      )
    },
    nonGalleryAttachments () {
      return this.status.attachments.filter(
        file => !fileType.fileMatchesSomeType(this.galleryTypes, file)
      )
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
    setMedia () {
      const attachments = this.attachmentSize === 'hide' ? this.status.attachments : this.galleryAttachments
      return () => this.$store.dispatch('setMedia', attachments)
    }
  }
}

export default StatusContent
